import { useState } from "react"
import {Link, useNavigate} from "react-router-dom"
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import GoogleAuth from "../components/GoogleAuth";
import { ReactComponent as ArrowRightIcon } from "../assets/svg/keyboardArrowRightIcon.svg"
import visibilityIcon from "../assets/svg/visibilityIcon.svg"
import { toast } from "react-toastify";
function SignIn() {

  // setting the show password icon to make password visible
  const [showPassword, setShowPassword] = useState(false)
  // const user=useState()

  // setting form data
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const { email, password } = formData

  const navigate = useNavigate()

  // Getting What the user is typing presently
  const onChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.id]: e.target.value,
    }))
  }

  // Signing in an already existing user
  const onSubmit = async (e) => {
    e.preventDefault()

    try{
      const auth = getAuth()

      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      if (userCredential.user) {
        navigate("/profile", toast.success('Welcome Back!', {
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
      } catch (error){
        toast.error("User Not Found", {
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
    return (
      <>
      <div className="pageContainer">
        <header>
          <p className="pageHeader">Welcome Back!</p>
        </header>

        <form onSubmit={onSubmit}>
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

          <div className="signInBar">
            <p className="signInText">Sign In</p>
            <button className="signInButton">
              <ArrowRightIcon fill="#ffffff" width="34px" height="34px"/>
            </button>
          </div>
        </form>

        {/* Google Authentication */}
        <GoogleAuth />

        <Link to="/sign-up" className="registerLink">
          Sign Up Now
        </Link>
      </div>
      </>
    )
  }
  
  export default SignIn