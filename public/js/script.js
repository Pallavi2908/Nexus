let selectedFiles = []; //to never loose the files we uploaded before selecting a new batch

function loadFile(event) {
  console.log("entered function");
  const maxFiles = 5;
  const files = event.target.files;

  if (selectedFiles.length + files.length > maxFiles) {
    alert(`Maximum ${maxFiles} files allowed`);
    event.target.value = "";
    return;
  }

  Array.from(files).forEach((f) => {
    selectedFiles.push(f);
  });

  // console.log("Selected files:", selectedFiles);

  renderPreview();

  event.target.value = "";
}

function renderPreview() {
  const previewImg = document.getElementById("preview-img");
  previewImg.innerHTML = "";
  selectedFiles.forEach((f, index) => {
    const wrapper = document.createElement("div");
    wrapper.classList.add(
      "relative",
      "w-32",
      "h-32",
      "rounded",
      "overflow-hidden"
    );

    const img = document.createElement("img");
    img.src = URL.createObjectURL(f);
    img.classList.add("w-32", "h-32", "object-cover", "rounded");
    img.onload = () => URL.revokeObjectURL(img.src);

    const deleteBtn = document.createElement("button");
    deleteBtn.innerHTML = "x";
    deleteBtn.classList.add(
      "absolute",
      "top-1",
      "right-1",
      "bg-black",
      "text-yellow-400",
      "rounded-full",
      "w-6",
      "h-6",
      "flex",
      "items-center",
      "justify-center",
      "cursor-pointer"
    );

    deleteBtn.onclick = () => {
      selectedFiles.splice(index, 1);
      renderPreview();
    };

    wrapper.appendChild(img);
    wrapper.appendChild(deleteBtn);
    previewImg.appendChild(wrapper);
  });
}
const form = document.getElementById("form");

document.getElementById("form").addEventListener("submit", async (event) => {
  event.preventDefault(); //do not perfoerm default action, instead eecute code below
  //disable submit during uploading
  const uploadBtn = document.getElementById("btn-submit");
  uploadBtn.disabled = true;

  console.log("triggered upload btn");
  uploadBtn.classList.toggle("px-8"); // adds px-8
  uploadBtn.classList.toggle("px-4"); // adds px-8
  uploadBtn.classList.toggle("py-4"); // removes px-4
  uploadBtn.classList.toggle("py-2"); // removes px-4
  uploadBtn.textContent = "Now uploading, please wait!";
  const sigRes = await fetch("/get-signature");
  const sigData = await sigRes.json();
  const { timestamp, signature, apiKey, cloudName, folder } = sigData;

  const uploadPromises = selectedFiles.map((file) => {
    const fd = new FormData();
    fd.append("file", file);
    fd.append("api_key", apiKey);
    fd.append("timestamp", timestamp);
    fd.append("signature", signature);
    fd.append("folder", folder);
    // https://api.cloudinary.com/v1_1/<cloud name>/<resource_type>/upload
    return fetch(`https://api.cloudinary.com/v1_1/dfedndfmw/image/upload`, {
      method: "POST",
      body: fd,
    }).then((r) => r.json());
  });
  const results = await Promise.all(uploadPromises);
  const resUrl = results.map((item) => ({
    url: item.secure_url,
    public_id: item.public_id,
  }));
  console.log(resUrl); //we need the url because Sharp will perform image compression
  await fetch("/store-data", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ uploads: resUrl }),
  });

  //Promise.all is a much better method than waiting for each upload to happen sequentially! This brought down our average upload time from 30s+ to <10s accounting for all uploads

  //and the public_id is required to update the image
  uploadBtn.disabled = false;

  console.log("value of upload btn:", uploadBtn.disabled);
  document.getElementById("next-step-section").style.display = "block";
  uploadBtn.textContent = "Submit";
  selectedFiles = [];
  document.getElementById("preview-img").innerHTML = "";

  displayToast("Upload Complete ✔");
  // displayToast("Ready to begin compression");
});

function displayToast(message) {
  // console.log("i should be here");
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.remove("hidden");

  setTimeout(() => {
    toast.classList.add("hidden");
  }, 3000);
}
