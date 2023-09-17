
import axios from 'axios';
import { log } from 'console';
import express from 'express'
import mongoose from 'mongoose';
import { float } from 'webidl-conversions';
import dotenv from 'dotenv';

dotenv.config()

const port = 3000;
const app = express();
app.use(express.static("public"));

try {
    mongoose.connect(`${process.env.DB_URL}cryptoDb`); 
    console.log("Coonected to db");
} catch (error) {
    console.log(error);
} 

// Create a schema
const tickerSchema = mongoose.Schema({
    name: String,
    last: Number,
    buy: Number,
    sell: Number,
    volume: Number,
    base_unit: String
})

// Create a Model

const Ticker = mongoose.model("Ticker", tickerSchema)
const TopTenitems = {}


// Getting top !0 items

async function getData(){
    try {
        const response = await axios.get("https://api.wazirx.com/api/v2/tickers");
        const Items = response.data; 
        const keys = Object.keys(Items);
        keys.sort((a, b) => Items[b].value - Items[a].value);
        // console.log(topTen);
        for (let i = 0; i < 10; i++) {
            const key = keys[i];
            TopTenitems[key] = Items[key];
          }
        
          console.log(TopTenitems);
          for (const key in TopTenitems) {
            if (TopTenitems.hasOwnProperty(key)) {
              const itemData = TopTenitems[key];
              
                try {
                    
                    const existing = await Ticker.findOne({name: itemData.name})
                    if(!existing){


                    const cryptoItem = new Ticker({
                        name: itemData.name,
                        last: parseFloat(itemData.last),
                        buy: parseFloat(itemData.buy),
                        sell: parseFloat(itemData.sell),
                        volume: parseFloat(itemData.volume),
                        base_unit: itemData.base_unit,
                    });

                    cryptoItem.save()

                    }
                    else {
                        console.log("Crypto Items Exist");

                    }

                } catch (error) {
                    console.log(error);
                }

            
            
            }
        }

        

    } catch (error) {
        console.log(error);
    }
}
 
getData();

app.get('/', async(req,res) =>{
    try {
        const crypto = await Ticker.find();
        console.log(crypto);
        res.render('index.ejs',{crypto: crypto})

    } catch (error) {
        console.log(error);
    }
})

app.listen(port,() =>{
    console.log(`The suver is running on port ${port}`);
})