import {Link} from "react-router-dom"
import sellCategoryImage from "../assets/jpg/sale.jpg"
import rentCategoryImage from "../assets/jpg/rent.jpg"
function Explore() {
  return (
    <div className="explore">
      <header>
        <p className="pageHeader">Explore</p>
      </header>

      <main>
        {/* Slider */}

        <p className="exploreCategoryHeading">Categories</p>
        <div className="exploreCategories">

          {/* Rent Category */}

          <Link to="/category/rent">
            <img src={rentCategoryImage} alt="rent" className="exploreCategoryImg"/>
            <p className="exploreCategoryName">Things/Places for rent</p>
          </Link>

          {/* Sell category */}

          <Link to="/category/sale">
            <img src={sellCategoryImage} alt="sell" className="exploreCategoryImg"/>
            <p className="exploreCategoryName">Things/Places for sale</p>
          </Link>
        </div>
      </main>
    </div>
  )
}

export default Explore