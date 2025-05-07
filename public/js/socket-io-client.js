const username_form = document.querySelector("#username-modal-body");
const msg_form = document.querySelector("#form");
const msg_inp = document.querySelector("#msg-inp");
const username_input = document.querySelector("#username");
const username_errors = document.querySelector("#errors");

const socket = io({ autoConnect: false });

username_form.addEventListener("submit", (evt) => {
  evt.preventDefault();
  const username = username_input.value.trim();
  if (username.length === 0) {
    username_errors.innerText = "Username is required";
    username_errors.classList.remove("hidden");
    username_input.focus();
    return;
  } else if (!(username.length >= 5 && username.length <= 15)) {
    username_errors.innerText =
      "Username must have min 5 and max 15 characters";
    username_errors.classList.remove("hidden");
    username_input.focus();
    return;
  }
  document.cookie = `sca_username=${username}`;
  socket.connect();
});

msg_form.addEventListener("submit", (evt) => {
  evt.preventDefault();
  const message = msg_inp.value.trim();
  createNewMessage(message);
  socket.emit("message", { message: message });
  msg_inp.value = "";
});

function createNewUser(username) {
  const new_user_p = document.createElement("p");
  new_user_p.id = "new_user_description";
  new_user_p.innerText = `${username} joined the chat`;
  const new_user_h2 = document.createElement("h2");
  new_user_h2.innerText = "New user joined";
  const new_user_div = document.querySelector("#new_user");
  new_user_div.innerHTML = "";
  new_user_div.appendChild(new_user_h2);
  new_user_div.appendChild(new_user_p);
  new_user_div.classList.toggle("hidden");
  setTimeout(() => {
    new_user_div.classList.toggle("hidden");
  }, 3000);
}

function createNewMessage(message, fromUsername = undefined) {
  const chat_box = document.querySelector("#chat-box");
  const msg_p1 = document.createElement("p");
  const msg_p2 = document.createElement("p");
  const msg_div = document.createElement("div");
  if (fromUsername !== undefined) {
    msg_p1.classList.add("from");
    msg_p1.innerText = fromUsername;
    msg_div.appendChild(msg_p1);
  }
  msg_p2.classList.add("msg-content");
  msg_p2.innerText = message.trim();
  msg_div.appendChild(msg_p2);
  msg_div.classList.add(
    "msg",
    fromUsername ? "left" : "right",
    fromUsername ? "slide-right" : "slide-left"
  );
  chat_box.appendChild(msg_div);
  chat_box.scrollTop = chat_box.scrollHeight;
}

socket.on("connect", () => {
  username_input.value = "";
  username_form.parentNode.classList.toggle("hidden");
});

socket.on("new_user_joined", ({ joinedUsername }) => {
  createNewUser(joinedUsername);
});

socket.on("message", ({ message, fromUsername }) => {
  createNewMessage(message, fromUsername);
});
