import Event from "./Event";
import StripeProvider from "../utils/stripe";
import CheckoutForm from "./CheckoutFrom";
import { refundHost } from "../api/api";
import {Button} from './ui/button'
const HeroSection = () => {
  const handleClick = async () => {
    const res = await refundHost();
    console.log(res);
  }
  return (
    <>
     <StripeProvider>
        <div className="w-full py-4 px-6 min-h-screen">
          <CheckoutForm/>
           <Button className="mt-4"
           onClick={handleClick}
           >
                  get refund
            </Button>
          <Event />
        </div>
     </StripeProvider>
    </>
  );
};

export default HeroSection;
