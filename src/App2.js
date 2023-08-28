import './App.css';
import MainCanvas from "./components/MainCanvas.js"
import React from 'react';
import {db, functions} from './firebase-config'
import {collection, getDocs, addDoc, updateDoc, doc, deleteDoc} from "firebase/firestore";
import {httpsCallable} from "firebase/functions";

function App() {

  const [users, setUsers] = React.useState([]);
  const [newName, setNewName] = React.useState("");
  const [newAge, setNewAge] = React.useState(0);

  const usersCollectionRef = collection(db, "users");

  const createUser = async () => {
    await addDoc(usersCollectionRef, {name: newName, age: Number(newAge)});
    getUsers();
  }

  const getUsers = async () => {
    const data = await getDocs(usersCollectionRef);
    setUsers(data.docs.map((doc) => ({...doc.data(), id: doc.id})))
  }

  React.useEffect(() => {
    getUsers();
  }, [])

  const updateUser = async (id, age) => {
    const userDoc = doc(db, "users", id);
    const newFields = {age: age + 1};
    await updateDoc(userDoc, newFields);
    getUsers();
  }

  const deleteUser = async (id) => {
    const userDoc = doc(db, "users", id);
    await deleteDoc(userDoc);
    getUsers();
  }

  const [uri, setUri] = React.useState("");

  function fetchUri(){
    httpsCallable(functions, "toURICallable")({url: newName})
      .then((result) => {
        setUri(result.data);
      })
  }

  return (
    <div>
      <div>{uri}</div>
      <button onClick={fetchUri}>fetch uri</button>
      <input placeholder="Name..." onChange={(event) => {setNewName(event.target.value)}}/>
      <input type="number" placeholder="Age..." onChange={(event) => {setNewAge(event.target.value)}}/>
      <button onClick={createUser}>Create User</button>
      {users.map((user) => {
        return (
          <div>
            {" "}
            <h1>Name: {user.name}</h1>
            <h1>Age: {user.age}</h1>
            <button onClick={() => {updateUser(user.id, user.age)}}>Increase Age</button>
            <button onClick={() => {deleteUser(user.id)}}>Delete User</button>
          </div>
        )
      })}
      <MainCanvas uri={uri}/>
    </div>
    
  );
}

export default App;


// user can either input site link or image link
// image link can be handled natively, site link will call firebase api url
// loads html form link
// loops through document.images (?? can i do "document" ??)
// loads each image and finds largest
// returns image link of largest


// TODO: add image cropping feature
// TODO: add sidebar and top bar
//       add multiple canvases with names
// TODO: Firebase: user sign in, saves users canvases with images/locations (firestore?)
//       React: add sign in button/screen, saving of canvases
// TODO: download high quality images, annotate images, train yolov8, add to firebase, modify function to use model,
//       will return image link and cropping points
