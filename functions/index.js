/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

// const functions = require("firebase-functions")
const { calculateBackoffMillis } = require("@firebase/util");
const {onRequest, onCall} = require("firebase-functions/v2/https");

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

//REST Function:
// exports.helloWorld = onRequest((request, response) => {
//     console.log("hello from console log");
//     response.send("<h1>Hello from Firebase!</h1>");
// });

// //callable function:
// exports.hiWorld = onCall((data, context) => {
//     console.log(context);

//     return "Hello "+ data.data.name +" !!";
// });

exports.toURICallable = onCall((data, context) => {
    const axios = require('axios');

    if(!data.data.url) {
        return "no url provided";
    }

    const imageUrl = data.data.url;

    const base64Uri = new Promise((resolve, reject) => {
        axios
            .get(imageUrl, { responseType: 'arraybuffer' }) // Request the image as an array buffer
            .then(response => {
                const contentType = response.headers['content-type'];
                if(contentType && contentType.startsWith('image/')){
                    const imageBuffer = Buffer.from(response.data, 'binary'); // Convert the array buffer to a buffer
            
                    const base64Image = imageBuffer.toString('base64'); // Convert the buffer to base64
    
                    resolve(`data:image/jpeg;base64,${base64Image}`);
                } else {
                    resolve("not a valid url");
                }
            })
            .catch((error) => {
                resolve("internal error, likely not a valid url");
            });
        }).then((result) => {
            return result;
        })
    
    return base64Uri;
});

exports.getCrop = onCall((data, context) => {
    const axios = require('axios');

    const crop = new Promise((resolve, reject) => {
        axios({
            method: "POST",
            url: "https://detect.roboflow.com/wardrobe-builder/2",
            params: {
                api_key: "9Jze5yYUoF0fB8TkQBoP"
            },
            data: data.data.img,
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            }
        })
        .then(function(response) {
            // console.log(response.data);
            resolve(response.data)
        })
        .catch(function(error) {
            // console.log(error.message);
            resolve(error.message)
        });
    }).then((result) => {
        return result
    })
    return crop;
});

// exports.toURI = onRequest((data, context) => {
//     const axios = require('axios');

//     var base64Uri = "";
    
//     const imageUrl = 'https://bananarepublicfactory.gapfactory.com/webcontent/0053/290/143/cn53290143.jpg'; // Replace with the actual image URL
    
//     axios
//       .get(imageUrl, { responseType: 'arraybuffer' }) // Request the image as an array buffer
//       .then(response => {
//         const imageBuffer = Buffer.from(response.data, 'binary'); // Convert the array buffer to a buffer
    
//         const base64Image = imageBuffer.toString('base64'); // Convert the buffer to base64
    
//         base64Uri = `data:image/jpeg;base64,${base64Image}`; // Construct the base64 URI for the image
//         context.send("<h1>"+base64Uri+"</h1>");
//         // Save the base64 URI to a text file or use it as needed
//         // fs.writeFileSync('base64Image.txt', base64Uri, 'utf-8');
    
//         console.log('Image converted and saved as base64 URI.');
//       })
//       .catch(error => {
//         console.error('Error fetching or converting the image:', error);
//       });
//     console.log(base64Uri);
//     // context.send("<h1>"+base64Uri+"</h1>");
    
// });


