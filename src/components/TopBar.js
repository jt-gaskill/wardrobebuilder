import React from 'react';
import {fabric} from "fabric"
import {functions} from "../firebase-config"
import {httpsCallable} from "firebase/functions";
import UploadIcon from "./UploadIcon"
import Switch from "./Switch.js"
import Spinner from "./Spinner"

export default function TopBar({setUri, autoCrop, setAutoCrop, uri}) {
    const [urlInputField, setUrlInputField] = React.useState('');

    const reader = new FileReader();

    reader.addEventListener("load", () => {
        // console.log(reader.result)
        setUri(reader.result);
    })

    const imgAdded = (e) => {
        
        console.log(e)
        const inputElem = document.getElementById('myImg')
        const file = inputElem.files[0]
        // console.log(inputElem.files[0])
        reader.readAsDataURL(file)
    }

    function importUrl() {
        httpsCallable(functions, "toURICallable")({url: urlInputField})
            .then((result) => {
                setUri(result.data);
            })
        // setUri(urlInputField);
        setUrlInputField("");
    }

    function handleUpload(e) {
        hiddenFileInput.current.click();
    }

    const hiddenFileInput = React.useRef(null);


    return (
        <div className="bg-blue-500 text-white p-4 flex h-18">
            <input type="text" placeholder='image url' className='text-black' value={urlInputField} onChange={(e) => {setUrlInputField(e.target.value)}}/>
            <button className='bg-green-500 rounded mx-4 px-2' onClick={importUrl}>Import</button>
            <button onClick={handleUpload}><UploadIcon /></button>
            <input id="myImg" type="file" accept="image/*" onChange={imgAdded} style={{display: 'none'}} ref={hiddenFileInput}/>
            <span className='ps-5'>Autocrop: </span>
            <Switch autoCrop={autoCrop} setAutoCrop={setAutoCrop}/>
            <div className="ps-5">{uri ? <Spinner /> : <></>}</div>
        </div>
    );
};
