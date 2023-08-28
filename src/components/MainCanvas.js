import React from "react"
import {fabric} from "fabric"
import {doc} from "firebase/firestore"
import {functions} from "./../firebase-config"
import { httpsCallable } from "firebase/functions";


export default function MainCanvas({canvasRef, uri, addWardrobe, getWardrobe, loadedCanv, setCurrentName, setUri, autoCrop}) {
// export default function MainCanvas() {

    

    React.useEffect(() => {
        // console.log("effect: ", localUri)
        if(uri){
            if(autoCrop){
                new Promise((resolve, reject) => {
                    let crop;
                    httpsCallable(functions, "getCrop")({img: uri})
                        .then((result) => {
                            console.log(result)
                            crop = handleCropData(result.data.predictions)
                            console.log(crop)
                            resolve(crop)
                        })
                        .catch((error) => {
                            console.log(error)
                        })
                }).then((result) => {
                    console.log("result: ", result)
                    let crop = result;
                    fabric.Image.fromURL(uri, img => {
                        console.log(crop)
                        if(crop){
                            console.log("hello?")
                            const temp = img.toDataURL({
                                left: crop.x-(crop.width/2),
                                top: crop.y-(crop.height/2),
                                width: crop.width,
                                height: crop.height
                            })
                            console.log(temp)
                            fabric.Image.fromURL(temp, (newimg) => {
                                // tempimg = newimg;
                                newimg.setControlsVisibility({mtr:false})
                                canvasRef.current.add(newimg)
                            }, {selectable: true, lockRotation: true})
                        } else {
                            img.setControlsVisibility({mtr:false})
                            canvasRef.current.add(img)
                        }
                        canvasRef.current.requestRenderAll()
                    }, {selectable: true, lockRotation: true})
                    setUri(null)
                })
            } else {
                fabric.Image.fromURL(uri, img => {
                    img.setControlsVisibility({mtr:false})
                    canvasRef.current.add(img);
                    canvasRef.current.requestRenderAll();
                })
                setUri(null)
            }
            
            // fabric.Image.fromURL(uri, (img) => {
            //     img.setControlsVisibility({mtr:false})
            //     canvasRef.current.add(img)
            //     canvasRef.current.requestRenderAll()
            // })
            // setUri(null)
            
            
        }
    }, [uri])

    function handleCropData(data) {
        var hasShirt = false, hasPants = false;
        var i;
        for(i=0; i<data.length; i++){
            if(!hasShirt && data[i].class == "shirt"){
                hasShirt = true;
            } else if (!hasPants && data[i].class == "pant"){
                hasPants = true;
            }
            if(hasPants && hasShirt) {
                break;
            }
        }
        let seek = "";
        if(hasShirt){
            seek = "shirt"
        } else if (hasPants){
            seek = "pant"
        } else {
            return null
        }

        var maxConf = 0;
        var retData = {};
        for(i=0; i<data.length; i++){
            if(data[i].class == seek && data[i].confidence > maxConf){
                maxConf = data[i].confidence;
                retData = {height: data[i].height, width: data[i].width, x: data[i].x, y: data[i].y}
            }
        }
        return retData;
    }

    React.useEffect(() => {
        async function temp() {
            if(loadedCanv) {
                const canv = await getWardrobe(loadedCanv);
                if(canv == "dne"){
                    alert('wardrobe input not valid');
                } else {
                    canvasRef.current.loadFromJSON(canv.data(), () => {
                        setCurrentName(loadedCanv);
                        console.log("loaded ", loadedCanv);
                    })
                }
            }
            
            
        }
        temp();

        
        
    }, [loadedCanv])

    // const addRect = () => {
    //     const rect = new fabric.Rect({
    //         height: 280,
    //         width: 200,
    //         fill: 'yellow',
    //         selectable: true,
    //         evented: true
    //     });
    //     canvasRef.current.add(rect);
    //     canvasRef.current.renderAll();
    // }
    function getJSON() {
        // console.log(canvasRef.current.toJSON()["objects"][0]["src"]);
        addWardrobe("jawn", canvasRef.current.toJSON())
    }

    async function fromJSON() {
        const canv = await getWardrobe("jawn");
        canvasRef.current.loadFromJSON(canv.data(), () => {
            console.log("loaded jawn");
        })
    }

    return(
        <div className="w-7/8">
            {/* <button onClick={getJSON}>to json</button>
            <button onClick={fromJSON}>from json</button> */}
            {/* <button onClick={addRect}>Rectangle</button>             */}
            <div><canvas id="canvas"/></div>
        </div>
        
    )
}