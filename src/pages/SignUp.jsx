import { useState } from "react"
import {Link, useNavigate} from "react-router-dom"
import {getAuth, createUserWithEmailAndPassword, updateProfile} from "firebase/auth"
import {setDoc, doc, serverTimestamp} from "firebase/firestore"
import { db } from "../firebase.config"
import GoogleAuth from "../components/GoogleAuth"
import { ReactComponent as ArrowRightIcon } from "../assets/svg/keyboardArrowRightIcon.svg"
import visibilityIcon from "../assets/svg/visibilityIcon.svg"
import { toast } from "react-toastify";
function SignUp() {

  // setting the show password icon to make password visible
  const [showPassword, setShowPassword] = useState(false)

  // setting form data
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  })
  const { name, email, password } = formData

  const navigate = useNavigate()

  // Getting What the user is typing presently
  const onChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.id]: e.target.value,
    }))
  }

  // Signing Up new User or Adding new user

  const onSubmit = async (e) => {
    e.preventDefault()

    try{
      const auth = getAuth()

      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const user = userCredential.user

      updateProfile(auth.currentUser, {
        displayName: name
      })

      // saving our information in firestore database
      const formDataCopy = {...formData}
      delete formDataCopy.password  //delete the password from the database
      formDataCopy.timestamp = serverTimestamp() // adding the date and time of creating your accout to the database

      await setDoc(doc(db, "users", user.uid), formDataCopy) // adding our user the user collection in db

      navigate("/profile", toast.success('Welcome '+user.displayName, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
        })
        )
    } catch (error) {
      toast.error('Ckeck Your Infos!', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
        });
    }
  }
    return (
      <>
      <div className="pageContainer">
        <header>
          <p className="pageHeader">Welcome Back!</p>
        </header>

        <form onSubmit={onSubmit}>
        <input 
          type="text" 
          className="nameInput" 
          placeholder="Name" 
          id="name" value={name} 
          onChange={onChange} 
          />

          <input 
          type="email" 
          className="emailInput" 
          placeholder="email@gmail.com" 
          id="email" value={email} 
          onChange={onChange} 
          />

          <div className="passwordInputDiv">
            <input 
            type={showPassword ? "text" : "password"} 
            className="passwordInput" 
            placeholder="Password" 
            id="password" 
            value={password} 
            onChange={onChange} 
            />

            <img 
            src={visibilityIcon} 
            alt="show password" 
            className="showPassword" 
            onClick={() => setShowPassword ((prevState) => !prevState)} 
            />
          </div>

          <Link to='/forgot-password' className="forgotPasswordLink">
            Forgot Password
          </Link>

          <div className="signUpBar">
            <p className="signUpText">Sign Up</p>
            <button className="signUpButton">
              <ArrowRightIcon fill="#ffffff" width="34px" height="34px"/>
            </button>
          </div>
        </form>

        {/* Google Authentication */}

        <GoogleAuth />

        <Link to="/sign-in" className="registerLink">
          Sign In Now
        </Link>
      </div>
      </>
    )
  }
  
  export default SignUp