import { Link } from "react-router-dom"
import {ReactComponent as DeleteIcon} from "../assets/svg/deleteIcon.svg"
import bedIcon from "../assets/svg/bedIcon.svg"
import bathtubIcon from "../assets/svg/bathtubIcon.svg"

function ListingItem({ listing, id, onDelete}) {
  return (
    <li className="categoryListing">
        <Link to={`/category/${listing.type}/${id}`} className="categoryListingLink">
            <img src={listing.imgUrls[0]} alt={listing.name} className="categoryListingImg" />
            <div className="categoryListingDetails">
                <p className="categoryListingLocation">{listing.location}</p>
                <p className="categoryListingName">{listing.name}</p>
                <p className="categoryListingPrice">
                    {listing.offer ? listing.discountedPrice.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') : listing.regularPrice.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}CFA
                    {listing.type === 'rent' && "/ Day"}
                </p>
                <div className="categoryListingInfoDiv">
                    {listing.houseToRentOrSale
                    ?  
                    <>
                       <img src={bedIcon} alt='bed' />
                        <p className='categoryListingInfoText'>
                        {listing.bedrooms > 1
                            ? `${listing.bedrooms} Bedrooms`
                            : '1 Bedroom'}
                        </p>
                        <img src={bathtubIcon} alt='bath' />
                        <p className='categoryListingInfoText'>
                        {listing.bathrooms > 1
                            ? `${listing.bathrooms} Bathrooms`
                            : '1 Bathroom'}
                        </p>
                    </>
                    :
                        <p className="categoryListingInfoText">
                            {listing.numberOfProduct > 1
                            ? `${listing.numberOfProduct} Products`
                            : "1 Product"} of {listing.name} available
                        </p>
                    }
                    {/* <img src={bedIcon} alt="car" />
                    <p className="categoryListingInfoText">
                        {listing.numberOfProduct > 1
                        ? `${listing.numberOfProduct} Products`
                        : "1 Product"}
                    </p> */}
                </div>
            </div>
        </Link>
        {onDelete && (
            <DeleteIcon
                className="removeIcon"
                fill="red"
                onClick={() => onDelete(listing.id, listing.name)}
            />
        )}
    </li>
  )
}

export default ListingItem