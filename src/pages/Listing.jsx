import { useState, useEffect } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { getDoc, doc } from "firebase/firestore"
import { getAuth } from "firebase/auth"
import { db } from "../firebase.config"
import Spinner from "../components/Spinner"
import shareIcon from "../assets/svg/shareIcon.svg"

function Listing() {
    const [listing, setListing] = useState(null)
    const [loading, setLoading] = useState(true)
    const [shareLinkCopied, setShareLinkCopied] = useState(false)

    const navigate = useNavigate()
    const params = useParams()
    const auth = getAuth()
    
    useEffect(() => {
        const fetchListing = async () => {
            const docRef = doc(db, "listings", params.listingId)
            const docSnap = await getDoc(docRef)

            if(docSnap.exists()) {
                console.log(docSnap.data());
                setListing(docSnap.data())
                setLoading(false)
            }
        }

        fetchListing()
    }, [navigate, params.listingId])

    if(loading){
        return <Spinner/>
    }

    const customerDiscountedPrice = listing.regularPrice - listing.discountedPrice

  return <main>
    {/* slider */}

    <div className="shareIconDiv" onClick={() => {
        navigator.clipboard.writeText(window.location.href)
        setShareLinkCopied(true)

        // time taken to copy the link
        setTimeout(() => {
            setShareLinkCopied(false)
        }, 2000)
    }}>
        <img src={shareIcon} alt="Copy link" />
    </div>

    {shareLinkCopied && <p className="linkCopied">Link Copied!</p>}

    {/* Diplaying all the product details */}
    <div className="listingDetails">
        <p className="listingName">
            {listing.name} - {listing.offer ? listing.discountedPrice
                .toString()
                .replace(/\B(?=(\d{3})+(?!\d))/g,",")
            : listing.regularPrice
                .toString()
                .replace(/\B(?=(\d{3})+(?!\d))/g,",")}CFA
        </p>
        <p className="listingLocation">{listing.discountedPrice}</p>
        <p className="listingType">
            For {listing.type === "rent" ? "Rent" : "Sale"}
        </p>
        {listing.offer &&(
            <p className="discountPrice">
                {customerDiscountedPrice.toString()
                .replace(/\B(?=(\d{3})+(?!\d))/g,",")}CFA discount
            </p>
        )}

        <ul className="listingDetailsList">
            {listing.houseToRentOrSale && (
                <>
                    <li>
                        {listing.bedrooms > 1 ? `${listing.bedrooms} Bedrooms`
                        : "1 Bedroom"}
                    </li>
                    <li>
                    {listing.bathrooms > 1 ? `${listing.bathrooms} bathrooms`
                    : "1 Bathroom"}
                    </li>
                    <li>{listing.parking && "Parking Space"}</li>
                    <li>{listing.funished && "Funished"}</li>
                </>
            )}
            <li>
                {listing.numberOfProduct > 1 ? `${listing.numberOfProduct} Products Available`
                : "1 Product Available"}
            </li>
            <li>{listing.goodCondition ? "Product is In Good Condition" : "Not in Good Condition" }</li>
            <p className="listingLocationTitle">Location</p>

            {/* MAP */}

            {auth.currentUser?.uid !== listing.userRef && (
                <Link to={`/contact/${listing.userRef}?listingName=${listing.name}&listingLocation=${listing.location}`}className="primaryButton">
                    Contact Owner
                </Link>
            )}
        </ul>
    </div>
  </main>
}

export default Listing