import React from "react";
import PropTypes from "prop-types";
import { Button } from "react-bootstrap";

const Cover = ({ name, login, coverImg }) => {
    if ((name, login, coverImg)) {
        return (
            <div
                className="d-flex justify-content-center flex-column text-center "
                style={{ background: "#000", minHeight: "100vh" }}
            >
                <div className="mt-auto text-light mb-5">
                    <div
                        className="ratio ratio-1x1 mx-auto mb-2"
                        style={{ maxWidth: "640px"  }}
                    >
                    <img src={coverImg} alt="" class="img-fluid" />
                    </div>
                    <h1 style={{ color: 'red' }}>{name}</h1>
                    <p style={{ color: 'blue'}}>Please connect your wallet to continue.</p>
                    <Button
                        onClick={login}
                        variant="outline-light"
                        className="rounded-pill px-3 mt-3"
                    >
                        Connect Wallet
                    </Button>
                </div>
            </div>
        );
    }
    return null;
};

Cover.propTypes = {
    name: PropTypes.string,
};

Cover.defaultProps = {
    name: "",
};

export default Cover;
