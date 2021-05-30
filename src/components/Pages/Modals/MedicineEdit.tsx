import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import Modal from 'react-bootstrap/Modal';
import React, {useEffect, useGlobal, useRef, useState} from 'reactn';
import Row from "react-bootstrap/Row";
import {Alert} from "react-bootstrap";
import {clientFullName} from "../../../utility/common";
import {MedicineRecord} from "../../../types/RecordTypes";
import isMonthValid from "../Validation/IsMonthValid";
import isDayValid from "../Validation/IsDayValid";
import isYearValid from "../Validation/IsYearValid";

interface IProps {
    drugInfo: MedicineRecord
    onClose: (r: MedicineRecord | null) => void
    show: boolean
}

/**
 * Edit Modal for Medicine
 * @param {IProps} props
 * @returns {JSX.Element | null}
 */
const MedicineEdit = (props: IProps): JSX.Element | null => {
    const [show, setShow] = useState(props.show);
    const [drugInfo, setDrugInfo] = useState<MedicineRecord>(props.drugInfo);
    const [canSave, setCanSave] = useState(false);
    const [activeResident] = useGlobal('activeResident');
    const otc = drugInfo.OTC;
    const textInput = useRef<HTMLInputElement>(null);

    // Observer for show
    useEffect(() => {
        setShow(props.show)
    }, [props.show]);

    // Observer/mutator for drugInfo
    useEffect(() => {
        const info = {...props.drugInfo};
        if (info?.Directions === null) {
            info.Directions = '';
        }
        if (info?.Notes === null) {
            info.Notes = '';
        }
        if (info?.FillDateMonth === null) {
            info.FillDateMonth = '';
        }
        if (info?.FillDateDay === null) {
            info.FillDateDay = '';
        }
        if (info?.FillDateYear === null) {
            info.FillDateYear = '';
        }
        setDrugInfo(info);
    }, [props.drugInfo]);

    // Disable the Save button if the Drug name is empty.
    useEffect(() => {
        if (drugInfo?.Drug.length > 0) {
            // Check if any of the FillDate fields are populated then all need to be populated or all blank
            let cnt = 0;
            if (drugInfo.FillDateMonth !== "") {
                cnt++;
            }
            if (drugInfo.FillDateDay !== "") {
                cnt++;
            }
            if (drugInfo.FillDateYear !== "") {
                cnt++;
            }

            // If any elements have an is-invalid class marker then don't allow a save.
            const isInvalidClasses = document.querySelectorAll('.is-invalid');
            setCanSave(isInvalidClasses.length === 0 && (cnt === 0 || cnt === 3));
        } else {
            setCanSave(false);
        }
    }, [drugInfo, setCanSave]);

    /**
     * Fires when a text field or checkbox is changing.
     * @param {React.ChangeEvent<HTMLElement>} e
     */
    const handleOnChange = (e: React.ChangeEvent<HTMLElement>) => {
        const target = e.target as HTMLInputElement;
        const value = target.type === 'checkbox' ? target.checked : target.value;
        const name = target.name;
        drugInfo[name] = value;
        setDrugInfo({...drugInfo});
    }

    /**
     * Fires when the user clicks on save or cancel
     * @param {React.MouseEvent<HTMLElement>} e
     * @param {boolean} shouldSave
     */
    const handleHide = (e: React.MouseEvent<HTMLElement>, shouldSave: boolean) => {
        e.preventDefault();
        if (shouldSave) {
            props.onClose({...drugInfo});
        } else {
            props.onClose(null);
        }
        setShow(false);
    }

    // Short circuit render if there is no drugInfo record.
    if (!drugInfo) {
        return null;
    }

    const drugTitleType = drugInfo.Id ? 'Edit ' : 'Add ' as string;
    const drugName = drugInfo.Id ? drugInfo.Drug : 'new drug';
    const fullName = activeResident && clientFullName(activeResident);
    const modalTitle = otc ?
        (
            <Modal.Title>
                {drugTitleType} OTC <b style={{color: "blue"}}><i>{drugName}</i></b>
            </Modal.Title>
        ) : (
            <Modal.Title>
                {drugTitleType} <b style={{color: "blue"}}><i>{drugName}</i></b>
                <span> for </span><b style={{backgroundColor: "yellow"}}>{fullName}</b>
            </Modal.Title>
        );

    return (
        <Modal
            backdrop="static"
            centered
            onEntered={() => {
                if (textInput && textInput.current) {
                    textInput.current.focus()
                }
            }}
            show={show}
            size="lg"
        >
            <Modal.Header closeButton>
                {modalTitle}
            </Modal.Header>

            <Modal.Body>
                <Form>
                    {otc && drugInfo?.Id &&
                        (
                            <Form.Group as={Row} controlId="otc-alert">
                            <Form.Label
                                column sm="2"
                            >
                                <span style={{color: "red"}}><b>OTC Warning</b></span>
                            </Form.Label>

                            <Col sm="9">
                                <Alert
                                    variant="danger"
                                >
                                <span style={{color: "red"}}>
                                    <b>CAUTION:</b>
                                </span> Changes to this OTC medicine will affect <b>ALL</b> residents!
                                </Alert>
                            </Col>
                            </Form.Group>
                        )
                    }

                    <Form.Group as={Row}>
                        <Form.Label column sm="2">
                            Drug Name
                        </Form.Label>

                        <Col sm="4">
                            <Form.Control
                                className={drugInfo.Drug !== '' ? '' : 'is-invalid'}
                                ref={textInput}
                                type="text"
                                value={drugInfo.Drug}
                                name="Drug"
                                onChange={(e) => handleOnChange(e)}
                                required
                            />
                            <div className="invalid-feedback">
                                Drug Name cannot be blank.
                            </div>
                        </Col>

                        <Form.Label column sm="1">
                            Strength
                        </Form.Label>

                        <Col sm="4">
                            <Form.Control
                                type="text"
                                value={drugInfo.Strength ? drugInfo.Strength : ''}
                                placeholder="e.g. 100 MG TABS"
                                name="Strength"
                                onChange={(e) => handleOnChange(e)}
                            />
                        </Col>
                    </Form.Group>

                    <Form.Group as={Row} controlId="drug-Directions">
                        <Form.Label column sm="2">
                            Directions
                        </Form.Label>

                        <Col sm="9">
                            <Form.Control
                                as="textarea"
                                rows={2}
                                value={drugInfo.Directions ? drugInfo.Directions : ''}
                                placeholder="e.g. Take 1 tablet at bedtime"
                                name="Directions"
                                onChange={(e) => handleOnChange(e)}
                            />
                        </Col>
                    </Form.Group>

                    {!otc &&
                    <Form.Group as={Row} controlId="otc-drug-Notes">
                        <Form.Label column sm="2">
                            Notes
                        </Form.Label>

                        <Col sm="9">
                            <Form.Control
                                as="textarea"
                                rows={3}
                                value={(drugInfo && drugInfo.Notes) || ''}
                                name="Notes"
                                onChange={(e) => handleOnChange(e)}
                            />
                        </Col>
                    </Form.Group>
                    }

                    <Form.Group as={Row} controlId="drug-barcode">
                        <Form.Label column sm="2">
                            Barcode
                        </Form.Label>

                        <Col sm="9">
                            <Form.Control
                                type="text"
                                value={drugInfo.Barcode ? drugInfo.Barcode : ''}
                                name="Barcode"
                                onChange={(e) => handleOnChange(e)}
                            />
                        </Col>
                    </Form.Group>

                    {!otc && drugInfo &&
                    <Form.Group as={Row}>
                        <Form.Label column sm="2">
                            Fill Date
                        </Form.Label>
                        <Form.Label column sm="1">
                            Month
                        </Form.Label>
                        <Col sm="2">
                            <Form.Control
                                className={
                                    drugInfo.FillDateMonth?.length === 0 ?
                                        ""
                                        :
                                        isMonthValid(drugInfo.FillDateMonth as string)
                                }
                                type="text"
                                value={drugInfo.FillDateMonth}
                                name="FillDateMonth"
                                onChange={(e) => handleOnChange(e)}>
                            </Form.Control>
                            <div className="invalid-feedback">
                                Invalid Month
                            </div>
                        </Col>
                        <Form.Label column sm="1">
                            Day
                        </Form.Label>
                        <Col sm="2">
                            <Form.Control
                                className={
                                    drugInfo.FillDateDay === "" ?
                                        ""
                                        :
                                        isDayValid(drugInfo.FillDateDay as string, drugInfo.FillDateMonth as string)
                                }
                                type="text"
                                value={drugInfo.FillDateDay}
                                name="FillDateDay"
                                onChange={(e) => handleOnChange(e)}
                            />
                            <div className="invalid-feedback">
                                Invalid Day
                            </div>
                        </Col>
                        <Form.Label column sm="1">
                            Year
                        </Form.Label>
                        <Col sm={2}>
                            <Form.Control
                                className={
                                    drugInfo.FillDateYear === "" ?
                                        ""
                                        :
                                        isYearValid(drugInfo.FillDateYear as string, false)
                                }
                                type="text"
                                value={drugInfo.FillDateYear}
                                name="FillDateYear"
                                onChange={(e) => handleOnChange(e)}
                            />
                            <div className="invalid-feedback">
                                Invalid Year
                            </div>
                        </Col>
                    </Form.Group>
                    }
                </Form>
            </Modal.Body>

            <Modal.Footer>
                <Button
                    onClick={(e) => handleHide(e, false)}
                    variant="secondary"
                >
                    Cancel
                </Button>
                <Button
                    disabled={!canSave}
                    onClick={(e) => handleHide(e, true)}
                    variant={otc && drugTitleType === 'Edit ' ? "danger" : "primary"}
                >
                    Save changes
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

export default MedicineEdit;
