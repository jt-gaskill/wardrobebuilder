import React from "react";
import MainCanvas from "./MainCanvas";
import TopBar from "./TopBar";
import {functions} from "./../firebase-config"
import { httpsCallable } from "firebase/functions";

export default function MainBody({canvasRef, addWardrobe, getWardrobe, loadedCanv, setCurrentName, currentName, autoCrop, setAutoCrop}) {

    const [uri, setUri] = React.useState('');

    // function handleCrop(){
    //     console.log(uri)
    //     httpsCallable(functions, "getCrop")({img: uri})
    //     .then((result) => {
    //         console.log(result)
    //     })
    // }

    return (
        <div className="flex flex-col w-7/8 p-0">
            {/* <button onClick={handleCrop}>ilabsasdgf</button> */}
            <TopBar setUri={setUri} autoCrop={autoCrop} setAutoCrop={setAutoCrop} uri={uri}/>
            <MainCanvas canvasRef={canvasRef} uri={uri} addWardrobe={addWardrobe} getWardrobe={getWardrobe} loadedCanv={loadedCanv} setCurrentName={setCurrentName} setUri={setUri} autoCrop={autoCrop}/>
        </div>
    )
}