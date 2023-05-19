import { useState, useEffect, useRef } from "react"
import { getAuth, onAuthStateChanged } from "firebase/auth"
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import {db} from "../firebase.config"
import {v4 as uuidv4} from "uuid"
import { useNavigate } from "react-router-dom"
import { toast } from "react-toastify"
import Spinner from "../components/Spinner"

function CreateListing() {
    const [geolocationEnable, setGeolocationEnable] = useState(false)
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        type: "rent",
        name: "",
        houseToRentOrSale:false,
        bedrooms:1,
        bathrooms:1,
        parking:false,
        furnished:false,
        numberOfProduct: 1,
        goodCondition: false,
        address: "",
        offer: false,
        regularPrice: 0,
        discountedPrice: 0,
        images: {},
        latitude: 0,
        longitude: 0,
    })

    const {
        type,
        name,
        houseToRentOrSale,
        bedrooms,
        bathrooms,
        parking,
        furnished,
        numberOfProduct,
        goodCondition,
        address,
        offer,
        regularPrice,
        discountedPrice,
        images,
        latitude,
        longitude
     } = formData

    const auth = getAuth()
    const navigate = useNavigate()
    const isMounted = useRef(true)

    useEffect(() => {
        if(isMounted) {
            onAuthStateChanged(auth, (user) => {
                if(user){
                    setFormData({...formData, userRef: user.uid})
                } else {
                    navigate("/sign-in")
                }
            })
        }

        return () => {
            isMounted.current =false
        }
    }, [isMounted])

    const onSubmit = async (e) => {
        e.preventDefault()
        // console.log(formData)

        setLoading(true)
        // checking the differences between the regular price and discounted price
        if (discountedPrice >= regularPrice){
            setLoading(false)
            toast.error("Discounted price "+discountedPrice+" need to be less than regular price "+regularPrice)
            return
        }

        // Creating a condition of maximium image to be inserted
        if(images.length > 6){
            setLoading(false)
            toast.error("Maximium of 6 Images")
            return
        }

        // Setting Geolocation
        let geolocation = {}
        let location 

        if (geolocationEnable) {
            const response = await fetch(
                `https://maps.googleapis.com/maps/api/geocode/json?address=${address}&key=${process.env.REACT_APP_GEOCODE_API_KEY}` 
            )

            const data = await response.json()
            // console.log(data)
            
            geolocation.lat = data.results[0]?.geometry.location.lat ?? 0
            geolocation.lng = data.results[0]?.geometry.location.lng ?? 0

            location = data.status === "ZERO_RESULTS" ? undefined : data.results[0]?.formatted_address

            if (location === undefined || location.includes("undefined")){
                setLoading(false)
                toast.error("Please enter a correct address")
            }
        } else {
            geolocation.lat = latitude
            geolocation.lng = longitude
            // location = address

            // console.log(location, address)
        }

        // Store one image in firebase
        const storeImage = async (image) => {
            return new Promise((resolve, reject) => {
                const storage = getStorage()
                const fileName = `${auth.currentUser.uid}-${image.name}-${uuidv4()}`

                const storageRef = ref(storage, "images/" + fileName)

                const uploadTask = uploadBytesResumable(storageRef, image);

                uploadTask.on('state_changed', 
                (snapshot) => {
                    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    console.log('Upload is ' + progress + '% done');
                    switch (snapshot.state) {
                    case 'paused':
                        console.log('Upload is paused');
                        break;
                    case 'running':
                        console.log('Upload is running');
                        break;
                    }
                }, 
                (error) => {
                    reject(error)
                }, 
                () => {
                    getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                    resolve(downloadURL);
                    });
                }
                
                );
            })
        }

        const imgUrls = await Promise.all(
            [...images].map((image) => storeImage(image))
        ).catch(() => {
            setLoading(false)
            toast.error("Images not uploaded, Try Again")
            return
        })

        // Saving and deleting some info about a product if not required in firestore
        const formDataCopy = {
            ...formData,
            imgUrls,
            geolocation,
            timestamp: serverTimestamp()
        }

        formDataCopy.location = address
        delete formDataCopy.images
        delete formDataCopy.address
        // location && (formDataCopy.location = location)
        !formDataCopy.offer && delete formDataCopy.discountedPrice
        !formDataCopy.houseToRentOrSale && delete formDataCopy.bathrooms
        !formDataCopy.houseToRentOrSale && delete formDataCopy.bedrooms
        !formDataCopy.houseToRentOrSale && delete formDataCopy.furnished
        !formDataCopy.houseToRentOrSale && delete formDataCopy.parking

        const docRef = await addDoc(collection(db, "listings"),formDataCopy)
        setLoading(false)
        toast.success("Info Saved")
        navigate(`/category/${formDataCopy.type}/${docRef.id}`)
    }

    const onMutate = (e) => {
        let boolean = null

        if(e.target.value === "true") {
            boolean = true
        }

        if(e.target.value === "false") {
            boolean = false
        }

        // Checking Image files
        if(e.target.files) {
            setFormData((prevState) => ({
                ...prevState,
                images: e.target.files
            }))
        }

        // Text,Booleans and Number
        if(!e.target.files) {
            setFormData((prevState) => ({
                ...prevState,
                [e.target.id]: boolean ?? e.target.value,
            }))
        }
    }

    if (loading) {
    return <Spinner/>
    }

  return (
    <div className="profile">
        <header>
            <p className="pageHeader">Create Product Info</p>
        </header>

        <main>
            <form onSubmit={onSubmit}>
                <label className="formLabel">Sell / Rent</label>
                <div className="formButton">
                    <button type="button"
                    className={type === "sale" ? "formButtonActive" : "formButton"}
                    id="type"
                    value="sale"
                    onClick={onMutate}
                    >
                        Sell
                    </button>

                    <button type="button"
                    className={type === "rent" ? "formButtonActive" : "formButton"}
                    id="type"
                    value="rent"
                    onClick={onMutate}
                    >
                        Rent
                    </button>
                </div>

                {/* Name of Product */}
                <label className="formLabel">Name of Product</label>
                <input type="text" className="formInputName" id="name" value={name} onChange={onMutate} maxLength="32" minLength="10" required />

                {/* If it's a House Property */}
                <label className='formLabel'>House Property</label>
                <div className='formButtons'>
                    <button
                    className={houseToRentOrSale ? 'formButtonActive' : 'formButton'}
                    type='button'
                    id='houseToRentOrSale'
                    value={true}
                    onClick={onMutate}
                    >
                    Yes
                    </button>
                    <button
                    className={
                        !houseToRentOrSale && houseToRentOrSale !== null ? 'formButtonActive' : 'formButton'
                    }
                    type='button'
                    id='houseToRentOrSale'
                    value={false}
                    onClick={onMutate}
                    >
                    No
                    </button>
                </div>

                {/* Numbers of bedrooms */}
                {houseToRentOrSale && (
                    <>
                      <div className='formRooms flex'>
                            <div>
                                <label className='formLabel'>Bedrooms</label>
                                    <input
                                        className='formInputSmall'
                                        type='number'
                                        id='bedrooms'
                                        value={bedrooms}
                                        onChange={onMutate}
                                        min='1'
                                        max='50'
                                        required
                                    />
                            </div>
                            <div>
                                <label className='formLabel'>Bathrooms</label>
                                    <input
                                        className='formInputSmall'
                                        type='number'
                                        id='bathrooms'
                                        value={bathrooms}
                                        onChange={onMutate}
                                        min='1'
                                        max='50'
                                        required
                                    />
                            </div>
                        </div>

                         {/* Parking Spot */}
                <label className='formLabel'>Parking spot</label>
                    <div className='formButtons'>
                        <button
                        className={parking ? 'formButtonActive' : 'formButton'}
                        type='button'
                        id='parking'
                        value={true}
                        onClick={onMutate}
                        min='1'
                        max='50'
                        >
                        Yes
                        </button>
                        <button
                        className={
                            !parking && parking !== null ? 'formButtonActive' : 'formButton'
                        }
                        type='button'
                        id='parking'
                        value={false}
                        onClick={onMutate}
                        >
                        No
                        </button>
                    </div>

                    {/* Furnished */}
                    <label className='formLabel'>Furnished</label>
                        <div className='formButtons'>
                            <button
                            className={furnished ? 'formButtonActive' : 'formButton'}
                            type='button'
                            id='furnished'
                            value={true}
                            onClick={onMutate}
                            >
                            Yes
                            </button>
                            <button
                            className={
                                !furnished && furnished !== null
                                ? 'formButtonActive'
                                : 'formButton'
                            }
                            type='button'
                            id='furnished'
                            value={false}
                            onClick={onMutate}
                            >
                            No
                            </button>
                        </div>
                    </>
                )}

               
                {/* Number of Product */}
                <div className="formLabel flex">
                    <div>
                        <label className="formLabel">Number of Product/Place</label>
                        <input type="number" className="formInputSmall" id="numberOfProduct" value={numberOfProduct} onChange={onMutate} min="1" max="50" required />
                    </div>
                </div>

                {/* Product Condition */}
                <label className="formLabel">Product Condition</label>
                <div className="formButtons">
                    <button className={goodCondition ? "formButtonActive" : "formButton"}
                    type="button"
                    id="goodCondition"
                    value={true}
                    onClick={onMutate}
                    min="1"
                    max="50"
                    >Good</button>

                    <button className={
                        !goodCondition && goodCondition !== null ? "formButtonActive" : "formButton"}
                    type="button"
                    id="goodCondition"
                    value={false}
                    onClick={onMutate}
                    >Bad</button>
                </div>

                {/* Address */}
                <label className="formLabel">Address</label>
                <textarea className="formInputAddress" type="text" id="address" value={address} onChange={onMutate} required />

                {/* Latitude and Longitude if Geolocation is enable */}
                {!geolocationEnable && (
                        <div className='formLatLng'>
                        <div>
                            <label className='formLabel'>Latitude</label>
                            <input
                            className='formInputSmall'
                            type='number'
                            id='latitude'
                            value={latitude}
                            onChange={onMutate}
                            required
                            />
                        </div>
                        <div>
                            <label className='formLabel'>Longitude</label>
                            <input
                            className='formInputSmall'
                            type='number'
                            id='longitude'
                            value={longitude}
                            onChange={onMutate}
                            required
                            />
                        </div>
                        </div>
                    )}

                {/* Offer Button */}
                <label className='formLabel'>Offer</label>
                <div className='formButtons'>
                    <button
                    className={offer ? 'formButtonActive' : 'formButton'}
                    type='button'
                    id='offer'
                    value={true}
                    onClick={onMutate}
                    >
                    Yes
                    </button>
                    <button
                    className={
                        !offer && offer !== null ? 'formButtonActive' : 'formButton'
                    }
                    type='button'
                    id='offer'
                    value={false}
                    onClick={onMutate}
                    >
                    No
                    </button>
                </div>

                {/* Regular Price */}
                <label className='formLabel'>Regular Price</label>
                <div className='formPriceDiv'>
                    <input
                    className='formInputSmall'
                    type='number'
                    id='regularPrice'
                    value={regularPrice}
                    onChange={onMutate}
                    min='50'
                    max='750000000'
                    required
                    />
                    {type === 'rent' && <p className='formPriceText'>CFA / Day</p>}
                </div>

                {/* Discounted Price if only offer is true */}
                {offer && (
                    <>
                    <label className='formLabel'>Discounted Price</label>
                    <input
                        className='formInputSmall'
                        type='number'
                        id='discountedPrice'
                        value={discountedPrice}
                        onChange={onMutate}
                        min='50'
                        max='750000000'
                        required={offer}
                    />
                    </>
                )}

                {/* Images of Product */}
                <label className='formLabel'>Images</label>
                <p className='imagesInfo'>
                    The first image will be the cover & maximium of 6 images.
                </p>
                <input
                    className='formInputFile'
                    type='file'
                    id="images"
                    onChange={onMutate}
                    max='6'
                    accept='.jpg,.png,.jpeg'
                    multiple
                    required
                />

                <button type='submit' className='primaryButton createListingButton'>
                    Submit Info Of Product
                </button>
            </form>
        </main>
    </div>
  )
}

export default CreateListing