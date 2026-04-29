import { SyncLoader } from "react-spinners";

export default function Loader() {
  return (
    <>
      <div className="loader">
        <SyncLoader speedMultiplier={1} color="#fff" />
      </div>
    </>
  );
}
