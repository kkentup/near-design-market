import React, { useState } from "react";
import PropTypes from "prop-types";
import { Button, Modal, Form, FloatingLabel } from "react-bootstrap";

const AddDesign = ({ save }) => {
    const [objectId, setObjectId] = useState("");
    const [image, setImage] = useState("");
    const [type, setType] = useState(0);
    const [price, setPrice] = useState("");
    const isFormFilled = () => objectId && image && type && price;

    const [show, setShow] = useState(false);

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    return (
        <>
            <Button
                onClick={handleShow}
                variant="dark"
                className="rounded-pill px-0"
                style={{ width: "38px" }}
            >
                <i className="bi bi-plus"></i>
            </Button>
            <Modal show={show} onHide={handleClose} centered>
                <Modal.Header closeButton>
                    <Modal.Title>New Design</Modal.Title>
                </Modal.Header>
                <Form>
                    <Modal.Body>
                        <FloatingLabel
                            controlId="inputObjectId"
                            label="Design object Id"
                            className="mb-3"
                        >
                            <Form.Control
                                type="text"
                                onChange={(e) => {
                                    setObjectId(e.target.value);
                                }}
                                placeholder="Enter object ID of design"
                            />
                        </FloatingLabel>
                        <FloatingLabel
                            controlId="inputUrl"
                            label="Image URL"
                            className="mb-3"
                        >
                            <Form.Control
                                type="text"
                                placeholder="Image URL"
                                onChange={(e) => {
                                    setImage(e.target.value);
                                }}
                            />
                        </FloatingLabel>
                        <FloatingLabel
                            controlId="inputType"
                            label="Type"
                            className="mb-3"
                        >
                            <Form.Control
                                type="number"
                                placeholder="Type"
                                onChange={(e) => {
                                    setType(e.target.value);
                                }}
                            />
                        </FloatingLabel>
                        <FloatingLabel
                            controlId="inputPrice"
                            label="Price"
                            className="mb-3"
                        >
                            <Form.Control
                                type="text"
                                placeholder="Price"
                                onChange={(e) => {
                                    setPrice(e.target.value);
                                }}
                            />
                        </FloatingLabel>
                    </Modal.Body>
                </Form>
                <Modal.Footer>
                    <Button variant="outline-secondary" onClick={handleClose}>
                        Close
                    </Button>
                    <Button
                        variant="dark"
                        disabled={!isFormFilled()}
                        onClick={() => {
                            save({
                                objectId,
                                type,
                                price,
                                image,
                            });
                            handleClose();
                        }}
                    >
                        Save design
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
};

AddDesign.propTypes = {
    save: PropTypes.func.isRequired,
};

export default AddDesign;
