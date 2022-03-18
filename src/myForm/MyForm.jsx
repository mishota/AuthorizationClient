import React from "react";
import { useState } from "react";
import { MainFetchApi, url } from "../api/Api";
import "./MyForm.css";

const initialUser = {
  name: "",
  email: "",
  password: "",
  text: "",
  img: null,
  file: null,
};
const refImage = React.createRef();

function MyForm() {
  const [user, setUser] = useState(initialUser);
  const [message, setMessage] = useState("");

  const handleChangeInput = (event) => {
    if (
      event.target.name === "img" &&
      event.target.files &&
      event.target.files[0]
    ) {
      console.warn(event.target.files[0]);
      if (event.target.files[0].size > 5242880) {
        setMessage("the image is too large (max-size: 5Mb)");
        return;
      }
      let img = event.target.files[0];

      setUser({
        ...user,
        img: URL.createObjectURL(img),
        file: img,
      });
      return;
    }

    if (
      event.target.name === "text" &&
      isFinite(event.target.value[event.target.value.length - 1])
    ) {
      return;
    }
    setUser({
      ...user,
      [event.target.name]: event.target.value,
    });
  };

  const handleSubmit = async (imageForm) => {
    console.warn(user);
    for (let key in user) {
      console.warn(user[key]);
      if (key !== "file") {
        if (user[key] === "" || user[key] === null) {
          setMessage(`Please enter your ${key}`);
          setTimeout(() => {
            setMessage("");
          }, 2000);
          return;
        }
      }
    }

    const imagePath = await MainFetchApi.uploadFile(user);

    if (!imagePath) {
      console.warn("imagePath did not create");
      return;
    }

    const userDto = {};
    Object.assign(userDto, user);
    userDto.img = imagePath;
    delete userDto.file;
    // delete userDto.blob;
    console.warn("userDto", userDto);

    const answer = await MainFetchApi.createUser(userDto);
    console.warn("answer", answer);
  };

  const handleFind = async () => {
    if (user.email === "" || user.password === "") {
      setMessage(`Please enter your email anf password`);
      setTimeout(() => {
        setMessage("");
      }, 2000);
      return;
    } else {
      const foundUser = await MainFetchApi.getUser(user.email, user.password);
      console.warn("foundUser", foundUser);
      if (foundUser) {
        foundUser.file = null;
        const parts = foundUser.img.split("\\");
        const img = `${url}/users/user/image/${parts[parts.length - 1]}`;
        foundUser.img = img;
        setUser(foundUser);
      }
    }
  };

  const triggerClick = () => {
    // refImage.current.click();
  };

  return (
    <div className="form">
      <h2>Registration Form</h2>

      <form>
        <div>
          <label>Name:</label>
        </div>
        <div>
          <input
            type="text"
            name="name"
            value={user.name}
            onChange={handleChangeInput}
          />
        </div>
        <div>
          <label>Email:</label>
        </div>
        <div>
          <input
            type="text"
            name="email"
            value={user.email}
            onChange={handleChangeInput}
          />
        </div>
        <div>
          <label>Password:</label>
        </div>
        <div>
          <input
            type="password"
            name="password"
            value={user.password}
            onChange={handleChangeInput}
          />
        </div>
        <div>
          <label>Enter information about yourself:</label>
        </div>
        <div>
          <textarea
            name="text"
            value={user.text}
            rows={2}
            onChange={handleChangeInput}
          />
        </div>
        <div>
          {user.img !== null && (
            <div className="preview-image">
              <img src={user.img} />
              {user.file !== null && (
                <div className="preview-info">
                  <div>Name: {user.file.name} /</div>
                  <div> Size: {Math.round(user.file.size / 9.54)} Mb</div>
                </div>
              )}
            </div>
          )}

          <div className="block-image">
            <div className="block-image-picker">
              <input
                type="file"
                name="img"
                accept="image/*"
                // style={{ display: "none" }}
                onChange={handleChangeInput}
                ref={refImage}
              />
            </div>
            <div className="block-image-button">
              <button onClick={triggerClick} className="choose-image">
                Select Image
              </button>
            </div>
          </div>
        </div>
        <div>
          <input
            type="button"
            value="Submit"
            className="submit"
            onClick={handleSubmit}
          />
        </div>
        {message !== "" && <label className="message">{message}</label>}
        <div>
          <input
            type="button"
            value="Find"
            className="submit"
            onClick={handleFind}
          />
        </div>
      </form>
    </div>
  );
}

export default MyForm;