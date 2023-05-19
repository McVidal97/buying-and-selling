import { useState } from "react" 
import { Link } from "react-router-dom";
import { getAuth, updateProfile } from "firebase/auth"
import {updateDoc, doc} from "firebase/firestore"
import { db } from "../firebase.config";
import { toast } from "react-toastify";
import { useNavigate} from "react-router-dom"
import arrowRight from "../assets/svg/keyboardArrowRightIcon.svg"
import homeIcon from "../assets/svg/homeIcon.svg"

function Profile() {
  const auth = getAuth()
  const [changeDetails, setChangeDetails] = useState(false)
  const [formData, setFormData] = useState({
    name:auth.currentUser.displayName,
    email:auth.currentUser.email,
  })

  const { name, email } = formData // removing the name and email from the form data
  // Logout
  const navigate = useNavigate()

  const onLogout = () =>{
    auth.signOut()
    navigate('/', toast.success('Good Bye!', {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "dark",
      }))
  }

  const onSubmit = async () => {
    try {
      // Update display name in fb
      await updateProfile(auth.currentUser, {
        displayName: name
      })

      // Update in firestore
      const userRef = doc(db, "users", auth.currentUser.uid)
      await updateDoc(userRef, {
        name,
      })
    } catch (error) {
      toast.error("Could no update profile details", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",});
    }
  }

  // Responsible for Changing the user details info
  const onChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.id]: e.target.value,
    }))
  }


    return <div className="profile">
      {/* Profile and Logout Btn */}
      <header className="profileHeader">
        <p className="pageHeader">My Profile</p>
        <button type="button" className="logOut" onClick={onLogout}>Logout</button>
      </header>

      {/* user details */}
      <main>
        <div className="profileDetailsHeader">
          <p className="profileDetailsText">Personal Details</p>
          <button className="changePersonalDetails" onClick={() => {
            changeDetails && onSubmit ()
            setChangeDetails((prevState) => !prevState)
          }}>
            {changeDetails ? "Done" : "change"}
          </button>
        </div>
        <div className="profileCard">
          <form>
            <input 
            type="text"
            id="name"
            className={!changeDetails ? "profileName" : "profileNameActive"}
            disabled={!changeDetails}
            value={name}
            onChange={onChange} />

            <input 
            type="text"
            id="email"
            className={!changeDetails ? "profileEmail" : "profileEmailActive"}
            disabled={!changeDetails}
            value={email}
            onChange={onChange} />
          </form>
        </div>
        <Link to={"/create-listing"} className="createListing" >
          <img src={homeIcon} alt="home"/>
          <p>Sell or Rent your Things/Places</p>
          <img src={arrowRight} alt="" />
        </Link>
      </main>
    </div>
  }
  
  export default Profile