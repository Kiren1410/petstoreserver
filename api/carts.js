const express = require("express");
const router = express.Router();
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const auth = require("../middleware/auth");
const mongoose = require('mongoose');

//GET CART
router.get("/", auth, async (req, res) => {
    try {
        let cart = await Cart.findOne({
            user: req.user._id
        }).populate(
            "items.product"
        );
        if (cart && cart.items.length > 0) return res.json(cart);
        return res.json({
            msg: "Your cart is empty"
        });
    } catch (e) {
        return res.json({
            e,
            msg: "No cart found"
        });
    }
});

//ADD CART
router.post("/", auth, async (req, res) => {
    try {
        if (req.user.isAdmin) return res.json({
            msg: "You cannot shop"
        });
        const {
            productId,
            quantity
        } = req.body;
        const product = await Product.findById(productId);
        const cart = await Cart.findOne({
            user: req.user._id
        });

        if (quantity > product.quantity) {
            return res.json({
                msg: "Cannot exceed quantity available"
            });
        }

        //IF CART IS EMPTY
        if (cart === null) {
            const myCart = await Cart.create({
                user: req.user._id,
                items: [{
                    product: productId,
                    quantity,
                    subtotal: product.price * quantity,
                }, ],
                total: product.price * quantity,
            });
            await myCart.save();
            return res.json({
                msg: "Product added to cart successfully",
                myCart
            });
        }

        if (cart) {
            const foundItem = cart.items.find((item) => item.product == productId);
            if (foundItem) {
                foundItem.quantity += parseInt(quantity);
                if (foundItem.quantity > product.quantity)
                    return res.json({
                        msg: "Cannot exceed available quantity"
                    });

                // foundItem.subtotal += quantity * product.price;
                //RECALCULATE SUBTOTAL
                foundItem.subtotal = foundItem.quantity * product.price;
                let total = 0;
                cart.items.map((p) => (total += p.subtotal));
                cart.total = total;
            } else {
                cart.items.push({
                    product: productId,
                    quantity,
                    subtotal: product.price * quantity,
                });
                cart.total += product.price * quantity;
            }
            await cart.save();
            return res.json({
                msg: "Added to cart successfully",
                cart
            });
        }
    } catch (e) {
        return res.json({
            e,
            msg: "Cannot add to cart"
        });
    }
});
//DELETING A SPECIFIC ITEM ON THE CART
router.delete("/:id", auth, async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.json({
                msg: "No such product exist"
            });
        }

        let cart = await Cart.findOne({
            user: req.user._id
        });

        if (!cart.items.length) return res.json({
            msg: "No product to delete"
        });

        cart.items = cart.items.filter((item) => item.product != req.params.id);
        let total = 0;
        cart.items.map((p) => (total += p.subtotal));
        cart.total = total;
        await cart.save();
        return res.json({
            msg: "Cart item deleted",
            cart
        });
    } catch (e) {
        return res.json({
            e,
            msg: "Cannot delete cart item"
        });
    }
});
//DELETE CART
router.delete("/", auth, async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.user._id)) {
            return res.json({
                msg: "No such product exist"
            });
        }
        //check if the post.user is the same as the id of the logged in user
        let currentCart = await Cart.findOne({
            user: req.user._id

        }); //find the post you are trying to delete
        if (!req.user._id) return res.json({
            msg: "No cart found"
        })
        await Cart.findByIdAndDelete(currentCart._id); //then therefore delete the post.
        return res.json({
            msg: "Cart deleted successfully",
            currentCart
        });
    } catch (e) {
        return res.json({
            e,
            msg: "Cannot delete cart"
        });
    }
});


module.exports = router;