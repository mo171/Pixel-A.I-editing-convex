## whenever handling file:

```jsx
const formData = await request.formData(); // ggets file from formdata send by frontend through req params
const file = formData.get("file"); // fomrdata is object so gets file
const fileName = formData.get("fileName");

if (!file || !fileName) {
    return NextResponse.json({ error: "File and fileName are required" }, { status: 400 });
}

// filteration of files same for most types of file
const bytes = await file.arrayBuffer();
const buffer = Buffer.from(bytes);

const timestamp = Math.floor(Date.now() / 1000);
const santinzedFileName = 
fileName?.replace(/[^a-zA-Z0-9.-]/g, "_") || `upload_${timestamp}`;
```

#forntend code to send file
``` jsx

const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));

      // Auto-generate title from filename
      const nameWithoutExt = file.name.replace(/\.[^/.]+$/, "");
      setProjectTitle(nameWithoutExt || "Untitled Project");
    }
  }, []);
  
/// using dropzone 
 const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".webp", ".gif"],
    },
    maxFiles: 1,
    maxSize: 20 * 1024 * 1024, // 20MB limit
  });

const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("fileName", selectedFile.name);

      const uploadResponse = await fetch("/api/imagekit/upload", {
        method: "POST",
        body: formData,
      });
```