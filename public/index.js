var express = require("express")
var bodyParser = require("body-parser")
var mongoose = require("mongoose")
const User = require('./models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');


const app = express()

app.use(bodyParser.json())
app.use(express.static('public'))
app.use(bodyParser.urlencoded({
    extended:true
}))

mongoose.connect('mongodb+srv://test190:csYjpoQJz53xU7iw@cluster01.ubzqovx.mongodb.net/',{
    useNewUrlParser: true,
    useUnifiedTopology: true
});

var db = mongoose.connection;

db.on('error',()=>console.log("Error in Connecting to Database"));
db.once('open',()=>console.log("Connected to Database"))

app.post("/sign_up",(req,res)=>{
    User.find({email:req.body.email})
    .exec()
    .then(user=>{
        if(user.length>=1){
            return res.status(409).json({
                message:'Mail exists'
            });
        }else{

    bcrypt.hash(req.body.password,10,(err,hash)=>{
        if (err){
            return res.status(500).json({
                error:err
            });
        }else{
            const user = new User({
                _id: new mongoose.Types.ObjectId(),
                name : req.body.name,
                email: req.body.email,
                password: hash
            });
            user.save().then(result=>{
                return res.status(200).json({
                    success:'New user has been created'
                });
            }).catch(err=>{
                return res.status(500).json({
                    error:err
                });
            }
            );
        }
    });
        }
    });

})

app.post("/login",(req,res)=>{
    User.find({email:req.body.email})
    .exec()
    .then(user=>{
        if (user.length<1){
            return res.status(401).json({
                message:'Auth failed, user not found'
            });
        }
        bcrypt.compare(req.body.password,user[0].password,(err,result)=>{
            if (err){
                return res.status(401).json({
                    message:'Auth failed'
                });
            }
            if (result){
                const JWTToken = jwt.sign({
                    name:user[0].name,
                    email:user[0].email,
                    _id:user[0]._id
                },
                "secret",
                {
                    expiresIn:'1m'
                });
                return res.status(200).json({
                    status: true, success: "Login Succesful", token: JWTToken
                });
                
            }
            return res.status(401).json({
                message:'Auth failed'
            });
        });

})
.catch(err=>{
    res.status(500).json({
        error:err
    });
});
}
);


app.get("/",(req,res)=>{
    res.set({
        "Allow-access-Allow-Origin": '*'
    })
    return res.redirect('index.html');
}).listen(3030);


console.log("Listening on PORT 3030");
