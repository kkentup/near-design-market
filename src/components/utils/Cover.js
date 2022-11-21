import React from "react";
import PropTypes from "prop-types";
import { Button } from "react-bootstrap";
import {IconButton} from "@mui/material";
import { IoFingerPrint } from "react-icons/io5";

const Cover = ({ name, login, coverImg }) => {
    if ((name, login, coverImg)) {
        return (
            <div
                className="background"
                style={{ minHeight: "100vh" }}
            >
                <div className="mt-auto text-light mb-5">
                    <br />
                    <br />
                    <div
                        className="ratio ratio-1x1 mx-auto mb-2"
                        style={{ maxWidth: "600px" }}
                    >
                    <img src={coverImg} style={{borderRadius:'50%'}} />

                    </div>
                    <h1 className="title"> {name} </h1>
                    <p className="sub-title">Please connect your wallet to continue.</p>

                    <IconButton onClick={login}  style={{ width: "100%", display: "flex", justifyContent: "center" }}>
                        <IoFingerPrint size="80" color="#591202" />
                    </IconButton>
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
