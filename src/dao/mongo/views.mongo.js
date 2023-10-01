import productsModel from "../models/products.model.js";
import cartsModel from "../models/carts.model.js";

const findProducts = async function (){
    try{
        let products = await productsModel.find().lean();
        if (!products) {
            throw Error("No se han encontrado productos.");
        }else{
            return products;
        }
    } catch{
        throw Error("Error al buscar los productos.");
    }
}

const findCarts = async function (){
    try{
        let carts = await cartsModel.find().populate('products.product').lean();
        if (!carts) {
            throw Error("No se han encontrado productos.");
        }else{
            return carts;
        }
    } catch{
        throw Error("Error al buscar los carritos.");
    }
}

const findAllUsers = async function (){
    try{
        const users = await userModel.find();    
        if (!users) {
            throw Error("No se han encontrado productos.");
        }else{
            return users;
        }
    } catch{
        throw Error("Error del servidor");
    }
}

export{
    findProducts,
    findCarts,
    findAllUsers
}