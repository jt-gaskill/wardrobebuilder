import './App.css';
import MainCanvas from "./components/MainCanvas.js"
import SideBar from "./components/SideBar.js"
import TopBar from './components/TopBar';
import React from 'react';
import {db, functions, storage} from './firebase-config'
import {doc, deleteDoc, setDoc, getDoc} from "firebase/firestore";
import {httpsCallable} from "firebase/functions";
import MainBody from './components/MainBody';
import {fabric} from "fabric";
import { act } from 'react-dom/test-utils';
import {getDownloadURL, listAll, ref, uploadBytes, uploadString} from 'firebase/storage'

function App() {

    const canvasRef = React.useRef(null);

    const [loadedCanv, setLoadedCanv] = React.useState("");
    const [currentName, setCurrentName] = React.useState("Untitled...");
    const [activeImg, setActiveImg] = React.useState(null)

    const [isCropping, setIsCropping] = React.useState(false)
    const croppingRect = React.useRef(null);
    const croppedImg = React.useRef(null);

    const [autoCrop, setAutoCrop] = React.useState(true)

    const addWardrobe = async (name, canv) => {
        await setDoc(doc(db, "wardrobes", name), canv);
    }

    const getWardrobe = async (name) => {
        const docRef = await doc(db, "wardrobes", name);
        // return docRef;
        const docSnapshot = await getDoc(docRef);
        if(docSnapshot.exists()){
            // console.log(docSnapshot)
            return docSnapshot;
        }
        return "dne";
    }

    const saveWardrobe = async () => {
        // console.log(canvasRef.current.toJSON())
        var tosave = canvasRef.current.toJSON()
        var i=0;
        for(i=0; i<tosave["objects"].length; i++){
            const imageRef = ref(storage, currentName+"/"+String(i))
            await uploadString(imageRef, tosave["objects"][i]["src"], 'data_url')
            .then((snapshot) => {
                // getDownloadURL(imageRef).then((url) => {
                //     console.log(url)
                // })
                // console.log(snapshot)
                tosave["objects"][i]["src"] = currentName+"/"+String(i)
            })
        }
        // console.log(tosave)
        // await setDoc(doc(db, "wardrobes", currentName), canvasRef.current.toJSON());
        await setDoc(doc(db, "wardrobes", currentName), tosave)
    }

    // prevents any other object from being selected while cropping
    React.useEffect(() => {
        if(isCropping){
            canvasRef.current.setActiveObject(activeImg)
            setActiveImg(croppingRect.current)
            canvasRef.current.requestRenderAll()
        }
    }, [activeImg])

    function remove() {
        const imgs = canvasRef.current.getActiveObjects();
        var i=0;
        for(i=0; i<imgs.length; i++){
            canvasRef.current.remove(imgs[i]);
        }
    }

    function correctCropBounds() {
        if(isCropping){
            var shape = croppingRect.current;
            var vals = shape.getBoundingRect()
            if(shape.get("left") < shape.get("maxLeft")){
                shape.set("left", shape.get("maxLeft"))
                shape.set("scaleX", 1)
            } 
            if(vals.left+vals.width > shape.get("maxRight")){
                shape.set("width", shape.get("maxRight")-vals.left-3)     
                shape.set("scaleX", 1)            
            } 
            if(vals.top < shape.get("maxTop")){
                shape.set("top", shape.get("maxTop"))
                shape.set("scaleY", 1)
            }
            if(vals.top+vals.height > shape.get("maxBottom")){
                shape.set("height", shape.get("maxBottom")-vals.top-3)
                shape.set("scaleY", 1)
            }
            canvasRef.current.requestRenderAll();
        }
    }

    React.useEffect(() => {
        canvasRef.current = new fabric.Canvas('canvas', {
            selectable: true,
            hoverCursor: 'pointer',
            height: window.innerHeight,
            width: window.innerWidth * (7/8)-14,
            backgroundColor: 'beige',
            evented: true
        })
        // canvasRef.current.on('mouse:down', () => {
        //     setActiveImg(canvasRef.current.getActiveObject())
        // })
    }, []);

    React.useEffect(() => {
        function handleClick() {
            setActiveImg(canvasRef.current.getActiveObject())
        }
        document.addEventListener('click', handleClick)
        return () => {
            document.removeEventListener('click', handleClick)
        }
    }, [])

    // adds and removes cropping box listeners
    React.useEffect(() => {
        if(isCropping){            
            canvasRef.current.on("mouse:move", correctCropBounds)
        } else {
            if(canvasRef.current.__eventListeners){
                if(canvasRef.current.__eventListeners["mouse:move"]){
                    delete canvasRef.current.__eventListeners["mouse:move"][0]
                } 
            }
        }
    }, [isCropping])


    function cropx() {
        if(activeImg && canvasRef.current.getActiveObjects().length == 1){
            if(!isCropping ){
                const img = canvasRef.current.getActiveObject();
                croppedImg.current = img;
                setIsCropping(true);
                const boundingBox = img.getBoundingRect();
                img.selectable = false;
                croppingRect.current = new fabric.Rect({
                    height: boundingBox.height-3,
                    width: boundingBox.width-3,
                    left: boundingBox.left,
                    top: boundingBox.top,
                    fill: "transparent",
                    lockMovementX: true,
                    lockMovementY: true,
                    lockScalingFlip: true,
                    borderColor: "red",
                    borderScaleFactor: 3,
                    borderOpacityWhenMoving: 1,
                    lockRotation: true,
                    borderDashArray: [10]
                })
                croppingRect.current.setControlsVisibility({mtr:false})
                croppingRect.current.set({maxLeft: boundingBox.left, maxRight: boundingBox.left+boundingBox.width, maxTop: boundingBox.top, maxBottom: boundingBox.top+boundingBox.height});
                canvasRef.current.setActiveObject(croppingRect.current);
                canvasRef.current.add(croppingRect.current);
                canvasRef.current.requestRenderAll();
            } else {
                // console.log(croppedImg.current)
                const cropBox = croppingRect.current.getBoundingRect();
                const imgBox = croppedImg.current.getBoundingRect();
                const temp = croppedImg.current.toDataURL({
                    left: cropBox.left-imgBox.left,
                    top: cropBox.top-imgBox.top,
                    width: cropBox.width,
                    height: cropBox.height
                })
    
                fabric.Image.fromURL(temp, (img) => {
                    img.setControlsVisibility({mtr:false})
                    canvasRef.current.add(img)
                    canvasRef.current.setActiveObject(img)
                    canvasRef.current.requestRenderAll()
                }, {lockRotation:true, selectable:true, left: cropBox.left, top: cropBox.top})
                
                setIsCropping(false)
                canvasRef.current.remove(croppingRect.current)
                croppingRect.current = null
                canvasRef.current.remove(croppedImg.current)
                // canvasRef.current.setActiveObject(croppedImg.current)
                croppedImg.current.selectable = true;
                croppedImg.current = null
                // canvasRef.current.requestRenderAll()
            }
        }
        
        
    }

    function uploadImage() {
        const imageRef = ref(storage, 'foldertest/firsttest') // second arg is path of image
        // uploadBytes(imageRef, "").then(() => { // second arg is whatever you are uploading
        uploadString(imageRef, "booyah").then(() => {
            alert("uploaded")
        })
    }

    function getimg() {
        const imageListRef = ref(storage, 'foldertest/')
        listAll(imageListRef).then((response) => {
            response.items.forEach((item) => {
                getDownloadURL(item).then((url) => {
                    // console.log(url)
                })
            })
        })
    }


    return (
        <div className="flex p-0">
            {/* <button onClick={getimg}>Upload image</button> */}
            <SideBar setLoadedCanv={setLoadedCanv} currentName={currentName} setCurrentName={setCurrentName} getWardrobe={getWardrobe} saveWardrobe={saveWardrobe} remove={remove} isCropping={isCropping} cropx={cropx} activeImg={activeImg} />
            <MainBody canvasRef={canvasRef} addWardrobe={addWardrobe} getWardrobe={getWardrobe} loadedCanv={loadedCanv} setCurrentName={setCurrentName} currentName={currentName} autoCrop={autoCrop} setAutoCrop={setAutoCrop}/>
        </div>
    )
}

export default App;