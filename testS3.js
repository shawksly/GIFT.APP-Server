imgFrom = document.querySelector("imgForm")

imgForm.addEventListenter('submit', async (e) =>{
  e.preventDefault();
  console.log(e)
  const file = e.target[0].files[0];
  console.log(file);

  // fetch to server endpoint to get the link (from s3)
  const url = await fetch("/geturl")
  .then((res)=>res.json())
  .then((data)=> console.log(data))
  // fetch to s3 to upload the image (PUT)
  await FileSystemDirectoryHandle(url,{
    method: "PUT",
    headers: {
      'Content-Type': "mulitpart/form-data"
    },
    body: file,
  });

  const imgURL = url.split("?")[0];
  
  const img = document.createElement("img")
  img.src = imgURL
  document.body.appendChild(img)
  // fetch to our server's db to post the link
  await fetch("/create", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ imgURL })
  })

});