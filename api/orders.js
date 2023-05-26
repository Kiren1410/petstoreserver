const express = require("express");
const router = express.Router();
const Cart = require("../models/Cart");
const Order = require("../models/Order");
const auth = require("../middleware/auth");
const stripe = require("stripe")(
  "sk_test_51N5KNyCEaaM0Zp23hctJdksmSEj9mMFo0ZJNNxuVe5sIgY00ZWeICavO5yoeKLNpu3PJUQTibVJ354GjSb10qzLO00GKSYsx2M"
);

router.post("/", auth, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (cart) {
      let myOrder = await Order.create({
        user: req.user._id,
        items: cart.items,
        total: cart.total,
      });

      const items = req.body.items;
      let lineItems = [];
      items.forEach((item) => {
        lineItems.push({
          price_data: {
            currency: "usd",
            product_data: {
              name: item.product.name,
            },
            unit_amount: item.product.price * 100,
          },
          quantity: item.quantity,
        });
      });

      const session = await stripe.checkout.sessions.create({
        line_items: lineItems,
        mode: "payment",
        success_url: "http://localhost:3000/success",
        cancel_url: "http://localhost:3000/cancel",
      });

      await myOrder.save();

      //then empty the cart
      await Cart.findByIdAndDelete(cart._id);
      return res.send(session.url);
    } else {
      return res.json({ msg: "Your cart is empty" });
    }
  } catch (e) {
    return res.json({ msg: "No cart found", e });
  }
});

router.get("/", auth, async (req, res) => {
  console.log(req.user)
  try {
    let orders = []
    if(req.user.isAdmin) {
       orders = await Order.find({}).populate("items.product").populate("user");
    } else {
      orders =  await Order.find({ user: req.user._id }).populate("items.product").populate("user");
    }
    return res.json(orders)
  } catch (e) {
    return res.json({ e, msg: "No orders found" });
  }
});

// router.get("/:id", auth, async (req, res) => {
//   try {
//     let orders = await Order.find({ user: req.params.id }).populate("items.product");
//     if (orders && orders.length >= 1) return res.json(orders);
//     return res.json({ msg: "Order is empty" });
//   } catch (e) {
//     return res.json({ e, msg: "No orders found" });
//   }
// });

module.exports = router;
