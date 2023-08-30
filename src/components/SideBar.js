import React from 'react';
import PencilIcon from "./PencilIcon.js"
import SaveIcon from "./SaveIcon.js"
import DeleteIcon from "./DeleteIcon.js"
import CropIcon from "./CropIcon.js"
import LoadIcon from "./LoadIcon.js"

export default function SideBar({setLoadedCanv, currentName, setCurrentName, getWardrobe, saveWardrobe, remove, isCropping, cropx, activeImg}) {

    const [loadInput, setLoadInput] = React.useState("");

    const [editLoad, setEditLoad] = React.useState(false);

    const [editName, setEditName] = React.useState(false);

    const [nameEditor, setNameEditor] = React.useState(currentName);

    // function handleNameInput(e) {
    //     console.log(e)
    //     if(e.key === "Enter"){
    //         console.log("enter")
    //         setEditName(!editName);
    //     }
    //     setCurrentName(e.target.value);
    // }

    React.useEffect(() => {
        const keyDownHandler = event => {
            if(event.key === 'Enter'){
                if(editName){
                    setEditName(false);
                } else if(editLoad){
                    setLoadedCanv(loadInput)
                }
                
            }
        }

        document.addEventListener('keydown', keyDownHandler);

        return () => {
            document.removeEventListener('keydown', keyDownHandler)
        }
    })

    function handleSave() {
        if(!currentName.includes("Untitled")){
            saveWardrobe();
        } else {
            alert("please set a name for this wardrobe")
        }
        
    }

    const firstRender = React.useRef(true);
    React.useEffect(() => {
        if(!firstRender.current){
            async function temp() {
                if(editName){
                    setNameEditor(currentName);
                } else {
                    var hasNumber = /\d/;

                    if(!nameEditor.includes("Untitled") && nameEditor.length > 2 && !hasNumber.test(nameEditor)){
                        const result = await getWardrobe(nameEditor);
                        if(result == "dne"){
                            setCurrentName(nameEditor);
                        } else {
                            alert("name taken, please try a different name")
                        }
                    } else {
                        if(nameEditor.length <= 2){
                            alert("pick a longer name")
                        } else if (hasNumber.test(nameEditor)){
                            alert("name cannot contain numbers")
                        } else {
                            alert("do not use default name")
                        }
                        
                    }
                    
                }
            }
            temp();
        } else {
            firstRender.current = false;
        }
    }, [editName])

    return (
        <div className="bg-gray-800 text-white w-1/8 p-4 ">
            <div className="text-xl font-semibold mb-4">Wardrobes</div>
            <ul className="space-y-2">
                <li className="hover:bg-gray-700 p-2 rounded flex justify-between">
                    {!editName ? <a href="#">{currentName}</a> : <input className="text-black w-28" type="text" value={nameEditor} onChange={(e) => {setNameEditor(e.target.value)}}/>}
                    <div className='flex'>
                        <button onClick={() => {setEditName(!editName)}}><PencilIcon /></button>
                        <button onClick={handleSave}><SaveIcon /></button>
                    </div>
                </li>
                <li className="hover:bg-gray-700 p-2 rounded flex justify-between">
                    <input type="text" placeholder="Load..." className="text-black w-28" onFocus={() => {setEditLoad(true)}} onBlur={() => {setEditLoad(false)}} value={loadInput} onChange={(e) => {setLoadInput(e.target.value)}}/>
                    <button onClick={() => {setLoadedCanv(loadInput)}}><LoadIcon /></button>
                </li>
                <li className={'hover:bg-gray-500 p-2 rounded bg-gray-700 ' + (!isCropping && activeImg ? "hover:cursor-pointer" : "hover:cursor-not-allowed")} onClick={remove}>
                    <DeleteIcon />
                </li>
                <li className={'hover:bg-gray-500 p-2 rounded bg-gray-700 ' + (activeImg ? "hover:cursor-pointer" : "hover:cursor-not-allowed")} onClick={cropx}>
                    <CropIcon />
                </li>
            </ul>
        </div>
    );
};
