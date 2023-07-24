import { useRef, useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import ShareLink from "./ShareLink";
import { Button } from "@mui/material";
import { renderFileIcon } from "../utils/renderFileIcon";
import dragOverAnimation from "../utils/dragOverAnimation";
import storage from "../config/firebaseStorage";
import { uploadBytesResumable, ref, getDownloadURL } from "firebase/storage";

const DragZone = () => {
  const [file, setFile] = useState<File | null>(null);
  const [link, setLink] = useState("");
  const [linkForEmail, setLinkForEmail] = useState('');
  const [isloading, setIsloading] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const dropZoneRef = useRef<HTMLInputElement | null>(null);
  const [animate, setAnimate] = useState(false);
  const [fileExt, setFileExt] = useState<string | undefined>("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const timeoutRef = useRef<NodeJS.Timeout | any>(null);
  const [uploadFileAction, setuploadFileAction] = useState<any | null>(null);
  const [uploadTaskState, setUploadTaskState] = useState<any | null>(null);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!e.currentTarget.classList.contains("bg-slate-100")) {
      e.currentTarget.classList.add("bg-slate-100");
    } else if (!animate) {
      setAnimate(true);
    }
    if (isloading) {
      setAnimate(false);
    }
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.currentTarget.classList.remove("bg-slate-100");
    animate && setAnimate(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.currentTarget.classList.remove("bg-slate-100");
    setAnimate(false);
    if (isloading) return toast.error("uploading in progress..");
    if (e.dataTransfer.files.length <= 1) {
      setFile(e.dataTransfer.files?.[0] || null);
      console.log(e.dataTransfer.files?.[0].name || null);
      setFileExt(e.dataTransfer.files?.[0].name.split(".").pop() || "unknown");
      clearTimeout(timeoutRef.current);
    } else toast.error("single file is allowed");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isloading) return;
    setFile(e.currentTarget.files?.[0] || null);
    setFileExt(e.currentTarget.files?.[0]?.name?.split(".").pop() || "unknown");
    clearTimeout(timeoutRef.current);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  // Function to pause the upload
  const pauseUpload = () => {
    if (file !== null) {
      uploadFileAction?.pause();
      toast.dismiss();
      toast("upload paused!");
    }
  };

  // Function to resume the upload
  const resumeUpload = () => {
    if (file !== null) {
      uploadFileAction?.resume();
      toast.dismiss();
      toast("upload resumed");
    }
  };

  // Function to cancel the upload
  const cancelUpload = () => {
    const confirmation = confirm("Do you want to cancel");
    if (confirmation) {
      if (file !== null) {
        if (uploadFileAction.snapshot.state === "paused") {
          uploadFileAction.resume();
        }
        uploadFileAction?.cancel();
      }
    }
  };
  const uploadFile = async () => {
    try {
      if (file === null) return;
      const formData = new FormData();
      formData.append("file", file || "");
      setIsloading(true);

      const storageRef = ref(storage, file?.name);

      // Convert File object to Blob
      const fileBlob = new Blob([file], { type: file?.type });

      const uploadTask = uploadBytesResumable(storageRef, fileBlob);
      setuploadFileAction(uploadTask);

      uploadTask.on("state_changed", async (snapshot) => {
        setUploadTaskState(snapshot);
        const progress = Math.floor(
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100
        );
        setUploadProgress(progress);
      });

      await uploadTask;
      const downloadUrl = await getDownloadURL(storageRef);
      const encodedUrl = encodeURIComponent(
        `${downloadUrl}?${uploadTaskState?.totalBytes}`
      );
      setLink(downloadUrl)
      setLinkForEmail(`${import.meta.env.VITE_APP_BASE_URL || 'http://localhost:5000'}/file/${encodedUrl}`);
      toast.success("uploaded successfully");
      setFileExt("success");
    } catch (err: any) {
      if (err.code === "storage/canceled") {
        toast.error("upload canceled");
      } else {
        toast.error("upload failed");
      }
      console.log(err);
      setFileExt("failed");
    } finally {
      setFile(null);
      setIsloading(false);
      setUploadProgress(0);
      timeoutRef.current = setTimeout(() => {
        setFileExt(undefined);
      }, 30000);
    }
  };

  useEffect(() => {
    // prevent default behavior when dropping files outside the drop zone
    const preventDefault = (e: DragEvent) => {
      e.preventDefault();
    };

    const preventDropOutside = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
    };

    document.addEventListener("dragover", preventDefault);
    document.addEventListener("drop", preventDropOutside);

    return () => {
      document.removeEventListener("dragover", preventDefault);
      document.removeEventListener("drop", preventDropOutside);
    };
  }, [file]);

  return (
    <div className="w-full bg-white p-8 rounded-3xl overflow-hidden shadow-xl">
      <div
        ref={dropZoneRef}
        className="w-full overflow-hidden flex justify-center items-end relative min-h-[60vh] sm:min-h-[300px] border-[2px] border-blue-500 rounded-3xl border-dashed transition-colors"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {isloading && (
          <>
            <div
              className={`absolute left-0 h-full overflow-hidden bg-blue-300`}
              style={{
                width: `${uploadProgress}%`,
                transition: "width linear 500ms",
              }}
            >
              <span className="absolute inset-0 bg-[linear-gradient(90deg,transparent,#ffffff80,transparent)] blur-xl animateProgressBar"></span>
            </div>
            {uploadProgress == 0 && (
              <div
                className={`absolute left-0 h-full overflow-hidden ${
                  uploadProgress == 0 && "w-full bg-[#eeeeee] animate-pulse"
                }`}
              ></div>
            )}
          </>
        )}
        <div
          className={`flex flex-col justify-center sm:pb-5 pb-12 leading-5 pointer-events-none transition-opacity ${
            isloading ? "opacity-0" : "opacity-100"
          }`}
        >
          <h1
            className={`font-bold text-lg pointer-events-none text-slate-700 z-10 truncate`}
          >
            Drag and Drop
          </h1>
          <p className="before:contents-[''] before:w-1/2 before:h-[1px] before:bg-[linear-gradient(90deg,transparent,#00000050)] before:block before:mr-1 after:contents-[''] after:w-1/2 after:h-[1px] after:bg-[linear-gradient(90deg,#00000050,transparent)] after:block flex items-center after:ml-1 text-slate-800 pointer-events-none">
            or
          </p>
          <Button
            onClick={() => inputRef.current?.click()}
            size="small"
            style={{ pointerEvents: animate ? "none" : "initial" }}
            disabled={isloading}
          >
            browse
          </Button>
        </div>
        {uploadProgress ? (
          <div
            className={`absolute font-semibold text-zinc-700 left-[50%] transform -translate-x-1/2 sm:bottom-12 bottom-[75px] pointer-events-none transition-opacity ${
              isloading ? "opacity-100" : "opacity-0"
            }`}
          >
            {uploadProgress}
            <span className="text-xs ml-[1px]">%</span>
          </div>
        ) : (
          <div
            className={`absolute font-semibold text-zinc-700 left-[50%] transform -translate-x-1/2 sm:bottom-12 bottom-[75px] pointer-events-none transition-opacity ${
              isloading ? "opacity-100" : "opacity-0"
            }`}
          >
            Loading..
          </div>
        )}
        <div
          className={`absolute transform inset-0 pointer-events-none transition-transform ${
            isloading ? "translate-y-0" : "-translate-y-9"
          }`}
        >
          {renderFileIcon(fileExt, animate, file)}
          {dragOverAnimation(animate)}
        </div>
        <input
          type="file"
          ref={inputRef}
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {link && !isloading && !file && <ShareLink linkForEmail={linkForEmail} link={link} />}

      <div className={`text-center mt-4 ${!file && "hidden"}`}>
        {!isloading ? (
          <div className="flex flex-col gap-2">
            <span className={`pointer-events-none font-semibold text-gray-600`}>
              {file?.name}
            </span>
            <Button variant="contained" color="primary" onClick={uploadFile}>
              upload
            </Button>
          </div>
        ) : (
          <div className="flex gap-2 w-fit mx-auto">
            {uploadTaskState?.state === "running" ? (
              <Button
                variant="contained"
                color="inherit"
                size="small"
                onClick={pauseUpload}
              >
                pause
              </Button>
            ) : (
              uploadTaskState?.state === "paused" && (
                <Button
                  variant="contained"
                  color="inherit"
                  size="small"
                  onClick={resumeUpload}
                >
                  resume
                </Button>
              )
            )}
            <Button
              variant="contained"
              color="error"
              size="small"
              onClick={cancelUpload}
            >
              Cancel
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DragZone;
