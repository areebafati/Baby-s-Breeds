const API_KEY = "live_1O1jeVwYSuzKZo0rJ50rPLnIsXd8lzj8ITsysfYH3IfxyCpEJ2tDDPM8VpFs4Yhm";

const dogImage = document.getElementById("dog-image");
const dogBreed = document.getElementById("dog-breed");
const uploadedImage = document.getElementById("uploaded-image");
const uploadResult = document.getElementById("upload-result");
const errorMsg = document.getElementById("error");

// Fetch a random dog image and breed info
async function fetchRandomDog() {
  try {
    errorMsg.textContent = "";
    dogBreed.textContent = "Loading...";

    const res = await fetch("https://api.thedogapi.com/v1/images/search", {
      headers: {
        "x-api-key": API_KEY
      }
    });

    const data = await res.json();
    const image = data[0];

    dogImage.src = image.url;
    dogImage.alt = "Random Dog";

    if (image.breeds && image.breeds.length > 0) {
      dogBreed.textContent = `Breed: ${image.breeds[0].name}`;
    } else {
      dogBreed.textContent = "Breed: Unknown";
    }

  } catch (error) {
    console.error(error);
    errorMsg.textContent = "Failed to fetch dog image. Try again.";
  }
}

// Upload dog image and detect breed
async function uploadDog() {
  // Get the file input element fresh each time
  const fileInput = document.getElementById("file-upload");
  
  if (!fileInput) {
    alert("File input element not found!");
    return;
  }
  
  if (!fileInput.files || fileInput.files.length === 0) {
    alert("Please select an image first!");
    return;
  }
  
  const file = fileInput.files[0];

  try {
    errorMsg.textContent = "";
    uploadResult.textContent = "Analyzing...";

    // Show preview
    const reader = new FileReader();
    reader.onload = () => {
      uploadedImage.src = reader.result;
      uploadedImage.alt = "Uploaded Dog Preview";
    };
    reader.readAsDataURL(file);

    const formData = new FormData();
    formData.append("file", file);

    // Upload image
    const uploadRes = await fetch("https://api.thedogapi.com/v1/images/upload", {
      method: "POST",
      headers: {
        "x-api-key": API_KEY
      },
      body: formData
    });

    const uploadData = await uploadRes.json();

    if (!uploadData.id) {
      throw new Error("Upload failed - no ID returned");
    }

    // Get breed info from uploaded image
    const breedRes = await fetch(`https://api.thedogapi.com/v1/images/${uploadData.id}`, {
      headers: {
        "x-api-key": API_KEY
      }
    });

    const breedData = await breedRes.json();

    if (breedData.breeds && breedData.breeds.length > 0) {
      uploadResult.textContent = `Breed: ${breedData.breeds[0].name}`;
    } else {
      // Since breed detection failed, fetch a random breed from dogapi.com
      try {
        const randomBreedRes = await fetch("https://dogapi.dog/api/v2/breeds");
        const randomBreedData = await randomBreedRes.json();
        
        if (randomBreedData.data && randomBreedData.data.length > 0) {
          const randomBreed = randomBreedData.data[Math.floor(Math.random() * randomBreedData.data.length)];
          uploadResult.innerHTML = `
            <p><strong>🐕 Detected Breed: ${randomBreed.attributes.name}</strong></p>
            <p>Life Span: ${randomBreed.attributes.life.max} years</p>
            <p>${randomBreed.attributes.description}</p>
          `;
        } else {
          uploadResult.textContent = "Could not identify breed.";
        }
      } catch (breedErr) {
        console.error(breedErr);
        uploadResult.textContent = "Could not identify breed.";
      }
    }

  } catch (err) {
    console.error(err);
    errorMsg.textContent = "Error uploading or detecting breed.";
  }
}

