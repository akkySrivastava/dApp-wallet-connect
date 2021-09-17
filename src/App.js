import { toast } from "react-toastify";
import Web3 from "web3";
import "./App.css";
import WalletConnector from "@walletconnect/client";
import QRCodeModal from "@walletconnect/qrcode-modal";
import { useEffect, useState } from "react";
import "react-toastify/dist/ReactToastify.css";

function App() {
  const [account, setAccount] = useState("");
  const [connectedState, setConnectedState] = useState([]);

  let web3 = new Web3(window.ethereum);
  console.log(connectedState);
  const handleWalletConnect = async () => {
    // set chain id and rpc mapping in provider options
    const connector = new WalletConnector({
      bridge: "https://bridge.walletconnect.org", // Required
      qrcodeModal: QRCodeModal,
    });
    console.log(connector.connected);
    if (connector.connected) {
      connector.killSession();
      connector.on("disconnect", (error, payload) => {
        if (error) {
          throw error;
        }

        // Delete connector
        console.log("disconnected");
      });
    }

    // Check if connection is already established
    if (!connector.connected) {
      // create new session
      connector.createSession();
      console.log(connector.connected);
    }

    // Subscribe to connection events
    connector.on("connect", (error, payload) => {
      if (error) {
        throw error;
      }

      // Get provided accounts and chainId
      console.log(payload);
      // const { accounts, chainId } = payload.params[0];
      // console.log(accounts, chainId);
      setConnectedState(payload.params[0]);
      // setAccount(connectedState?.accounts[0]);
    });

    connector.on("session_update", (error, payload) => {
      if (error) {
        throw error;
      }

      // Get updated accounts and chainId
      // const { accounts, chainId } = payload.params[0];
      setConnectedState(payload.params[0]);
      console.log(payload);
    });

    connector.on("disconnect", (error, payload) => {
      if (error) {
        throw error;
      }

      // Delete connector
      console.log("disconnected");
    });
  };

  const walletConnect = () => {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum);
      try {
        // ask user for permission
        window.ethereum.enable();
        // user approved permission
      } catch (error) {
        // user rejected permission
        console.log("user rejected permission");
      }
    } else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider);

      // no need to ask for permission
    } else {
      toast(
        "Non-Ethereum browser detected. You should consider trying MetaMask!",
        {
          position: "bottom-right",
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          style: {
            backgroundColor: "#fff",
            color: "#000",
          },
        }
      );
    }
  };

  const handleControl = () => {
    if (connectedState.length !== 0) {
      const connector = new WalletConnector({
        bridge: "https://bridge.walletconnect.org", // Required
        qrcodeModal: QRCodeModal,
      });
      connector.killSession();
      connector.on("disconnect", (error, payload) => {
        if (error) {
          throw error;
        }
        setConnectedState([]);
        // Delete connector
        console.log("disconnected");
      });

      toast("Disconnected", {
        position: "bottom-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        style: {
          backgroundColor: "#fff",
          color: "#000",
        },
      });
    } else {
      handleWalletConnect();
    }
  };

  useEffect(() => {
    web3.eth.getCoinbase((err, coinbase) => {
      if (err) {
        return;
      } else {
        setAccount(coinbase);
      }
    });
  }, [web3.eth]);

  console.log(account);

  return (
    <div className="App">
      <div className="left-wallet">
        <div className="wallet-container">
          {account !== "" && account !== undefined && account !== null ? (
            <pre>
              <small>{account}</small>
            </pre>
          ) : (
            <h3>For Desktop user</h3>
          )}

          <img
            src="https://cdn.dribbble.com/users/2574702/screenshots/6702374/metamask.gif"
            alt=""
          />
          <button onClick={() => walletConnect()}>
            Connect your wallet 👛
          </button>
        </div>
      </div>
      <div className="left-wallet">
        <div className="wallet-container">
          {connectedState.length !== 0 ? (
            <>
              <pre>
                <small>{connectedState?.accounts[0]}</small>
              </pre>
              <small>
                Connected with {`${connectedState?.peerMeta?.name}`}
              </small>
            </>
          ) : (
            <>
              <h3>For Mobile user</h3>

              <small>
                Connect up to 50+ mobile wallets <br />
                using QR code
              </small>
            </>
          )}

          <img
            src={
              connectedState.length !== 0
                ? connectedState?.peerMeta?.icons[0]
                : "https://walletconnect.org/walletconnect-logo.svg"
            }
            alt=""
          />
          <button onClick={handleControl}>
            {connectedState.length !== 0
              ? "Disconnect"
              : "Connect your wallet 👛"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
