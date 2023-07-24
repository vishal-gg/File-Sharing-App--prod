import { useState } from "react";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { Button } from "@mui/material";
import { toast } from "react-hot-toast";
import { useCopyToClipboard } from "../customHooks/useCopyToClipboard";
import axios from "axios";
import TextField from "@mui/material/TextField";
import MarkEmailReadIcon from "@mui/icons-material/MarkEmailRead";
import CancelIcon from "@mui/icons-material/Cancel";
import LinerProgress from '@mui/material/LinearProgress'

interface PropsType {
  link: string;
  linkForEmail: string;
}

interface EmailHistoryItem {
  senderEmail: string;
  receiverEmail: string;
}

interface formDataType {
  senderEmail: string;
  receiverEmail: string;
}

const ShareLink = ({ link, linkForEmail }: PropsType) => {
  const [copy] = useCopyToClipboard();
  const [isLoading, setIsLoading] = useState(false);
  const [emailHistory, setEmailHistory] = useState<EmailHistoryItem[]>([]);
  const [formData, setFormData] = useState<formDataType>({
    senderEmail: "",
    receiverEmail: "",
  });
  
  const [counter, setCounter] = useState(0);
  const [status, setStatus] = useState("pending");
  const [showAllEmails, setShowAllEmails] = useState(false);

  const sendEmail = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const { senderEmail, receiverEmail } = formData;
    if (!senderEmail || !receiverEmail) {
      setCounter((prev) => prev + 1);
      switch (counter) {
        case 0:
          return toast.error("Field is empty!");
        case 1:
          return toast.error("Fill the form.");
        case 4:
          return toast.error("Seriously?");
        case 8:
          return toast.success("Email sent!");
        case 10:
          return toast("Haah! gotch ya");
        case 20:
          return toast("Noop, not happening...");
        default:
          return;
      }
    }
    try {

      const url = import.meta.env.VITE_APP_BASE_URL && import.meta.env.VITE_APP_BASE_URL + "/file/send"

      setIsLoading(true);
      await axios.post( url || `http://localhost:5000/file/send`, {
        linkForEmail,
        senderEmail,
        receiverEmail,
      });
      setIsLoading(false);
      setStatus("success");
      toast.success("Email sent");
      setEmailHistory([...emailHistory, { senderEmail, receiverEmail }]);
    } catch (err: any) {
      console.log(err);
      setStatus("failed");
      setIsLoading(false);
      const filteredErr = err.response?.data?.error
      const doesInlcude = filteredErr.includes('email')
      toast.error(doesInlcude ? filteredErr : 'failed');
    } finally {
      setFormData({ senderEmail: "", receiverEmail: "" });
      setCounter(21); //this ignores those carcastic pop ups
    }
  };

  return (
    <div className="mx-4">
      <div className="flex justify-center mt-7">
        <div className="flex flex-col sm:flex-row rounded-md mx-5 truncate border border-dashed border-gray-300 bg-slate-100">
          <span className="text-zinc-500 font-medium truncate pt-[2px] px-2">
            {link}
          </span>
          <Button
            color="inherit"
            
            style={{ minWidth: "64px", borderRadius: "5px" }}
            onClick={() => {
              copy(link);
              toast.dismiss()
              toast.success("copied to clipboard!");
            }}
          >
            <ContentCopyIcon fontSize="small" />
          </Button>
        </div>
      </div>
      <span className="block text-center font-medium mt-3 truncate">
        --- send via email ---
      </span>
      <form className="flex flex-col" onSubmit={sendEmail}>
        <TextField
          className={`${
            isLoading && "pointer-events-none"
          } sm:w-[70%] w-[100%]`}
          style={{ marginInline: "auto" }}
          type="email"
          value={formData.senderEmail}
          onChange={(e) => {
            setFormData({ ...formData, senderEmail: e.target.value });
            setStatus("pending");
          }}
          label="From"
          variant="standard"
        />
        <TextField
          className={`${
            isLoading && "pointer-events-none"
          } sm:w-[70%] w-[100%]`}
          style={{ marginInline: "auto", marginTop: "5px" }}
          value={formData.receiverEmail}
          type="email"
          onChange={(e) => {
            setFormData({ ...formData, receiverEmail: e.target.value });
            setStatus("pending");
          }}
          label="To"
          variant="standard"
        />
        <Button
          style={{
            marginTop: "1rem",
            width: "70%",
            marginInline: "auto",
            marginBottom: "1rem",
            overflow: 'hidden'
          }}
          disabled={isLoading}
          type="submit"
          color={`${
            status === "pending"
              ? "primary"
              : status === "success"
              ? "success"
              : "error"
          }`}
          variant="contained"
        >
          {isLoading ? (
            "sending.."
          ) : status === "pending" ? (
            "send"
          ) : status === "success" ? (
            <MarkEmailReadIcon />
          ) : (
            <CancelIcon />
          )}
          {isLoading && <LinerProgress style={{height: '3px', width: '100%', position: 'absolute', bottom: '0'}} />}
        </Button>
      </form>
      {emailHistory.length !== 0 && (
        <p className="text-center font-medium text-sm text-zinc-500">History</p>
      )}
      {emailHistory
        .slice(0, showAllEmails ? emailHistory.length : 3)
        .map((item, index) => (
          <div
            key={index}
            className="text-zinc-600 font-medium bg-[#eeeeee] my-4 sm:mx-8 mx-0 p-3 rounded-md flex flex-col justify-center items-center overflow-hidden"
          >
            <div>
              <div>
                <span className="inline-block w-16 text-sm text-red-400">
                  sender:
                </span>
                 <span className="max-[480px]:block">{item.senderEmail}</span>
              </div>
              <h1>
                <span className="inline-block w-16 text-sm text-red-400">
                  receiver:
                </span>
                <span className="max-[480px]:block">{item.receiverEmail}</span>
              </h1>
            </div>
          </div>
        ))}
      {emailHistory.length > 3 && (
        <div className="text-center">
          <Button
            size="small"
            onClick={() => setShowAllEmails((prevShowAll) => !prevShowAll)}
          >
            {showAllEmails ? "Show Less" : "Show More"}
          </Button>
        </div>
      )}
    </div>
  );
};

export default ShareLink;
