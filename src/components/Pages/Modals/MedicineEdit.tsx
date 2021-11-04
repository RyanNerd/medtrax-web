import TooltipContainer from 'components/Pages/Containters/TooltipContainer';
import Alert from 'react-bootstrap/Alert';
import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import Row from 'react-bootstrap/Row';
import React, {useEffect, useRef, useState} from 'reactn';
import {MedicineRecord} from 'types/RecordTypes';
import {isDateFuture, isDayValid, isMonthValid, isYearValid} from 'utility/common';

interface IProps {
    allowDelete?: boolean;
    fullName?: string;
    drugInfo: MedicineRecord;
    onClose: (r: MedicineRecord | null) => void;
    show: boolean;
}

/**
 * Edit Modal for Medicine
 * @param {IProps} props Props for the component
 * @returns {JSX.Element | null}
 */
const MedicineEdit = (props: IProps): JSX.Element | null => {
    const [canSave, setCanSave] = useState(false);
    const [drugInfo, setDrugInfo] = useState<MedicineRecord>(props.drugInfo);
    const [show, setShow] = useState(props.show);
    const allowDelete = props.allowDelete;
    const onClose = props.onClose;
    const textInput = useRef<HTMLInputElement>(null);

    // Observer for show
    useEffect(() => {
        setShow(props.show);
    }, [props.show]);

    // Observer/mutator for drugInfo
    useEffect(() => {
        if (props.drugInfo) {
            const info = {...props.drugInfo};
            if (info.Directions === null) info.Directions = '';
            if (info.Notes === null) info.Notes = '';
            if (info.FillDateMonth === null) info.FillDateMonth = '';
            if (info.FillDateDay === null) info.FillDateDay = '';
            if (info.FillDateYear === null) info.FillDateYear = '';
            setDrugInfo(info);
        }
    }, [props.drugInfo]);

    // Disable the Save button if the Drug name is empty.
    useEffect(() => {
        if (drugInfo) {
            // Is the Drug field populated?
            if (drugInfo?.Drug.length > 0) {
                // If any elements have an is-invalid class marker or the fill date is incomplete/ invalid
                // then don't allow a save.
                const isInvalidClasses = document.querySelectorAll('.is-invalid');
                setCanSave(isInvalidClasses.length === 0);
            } else {
                setCanSave(false);
            }
        }
    }, [drugInfo, setCanSave]);

    /**
     * Returns true if the Fill Date fields have a valid fill date or if the fill date is empty.
     */
    const isFillDateValid = () => {
        const fillDateMonth = drugInfo.FillDateMonth;
        const fillDateDay = drugInfo.FillDateDay;
        const fillDateYear = drugInfo.FillDateYear;

        // Check if any of the FillDate fields are populated then all need to be populated or all blank
        let cnt = 0;
        if (fillDateMonth !== '') cnt++;
        if (fillDateDay !== '') cnt++;
        if (fillDateYear !== '') cnt++;

        // Fill date can't be in the future
        if (cnt === 3) {
            const fillDate = new Date(
                parseInt(fillDateYear as string),
                parseInt(fillDateMonth as string) - 1,
                parseInt(fillDateDay as string)
            );
            if (isDateFuture(fillDate)) cnt = 4;
        }
        return cnt === 0 || cnt === 3;
    };

    /**
     * Fires when a text field or checkbox is changing.
     * @param {React.ChangeEvent<HTMLElement>} e Change event object
     */
    const handleOnChange = (e: React.ChangeEvent<HTMLElement>) => {
        const target = e.target as HTMLInputElement;
        const value = target.type === 'checkbox' ? target.checked : target.value;
        const name = target.name;
        drugInfo[name] = value;
        setDrugInfo({...drugInfo});
    };

    /**
     * Fires when the user clicks on the Save or Cancel, or Delete button
     * @param {string} action "save", "cancel", or "delete"
     */
    const handleHide = (action: 'cancel' | 'save' | 'delete') => {
        if (action === 'save') onClose(drugInfo);
        if (action === 'cancel') onClose(null);
        if (action === 'delete') {
            const medInfo = {...drugInfo};
            medInfo.Id = -(medInfo.Id as number); // Set the Id as negative to indicate a delete operation
            onClose(medInfo);
        }
        setShow(false);
    };

    // Short circuit render if there is no drugInfo record.
    if (drugInfo === null || Object.keys(drugInfo).length === 0) {
        return null;
    }

    const otc = drugInfo.OTC;
    const drugTitleType = drugInfo.Id ? 'Edit ' : ('Add ' as string);
    const drugName = drugInfo.Id || drugInfo?.Drug.length > 0 ? drugInfo.Drug : 'new drug';
    const fullName = props.fullName;

    const modalTitle = otc ? (
        <Modal.Title>
            {drugTitleType} OTC{' '}
            <b style={{color: 'blue'}}>
                <i>{drugName}</i>
            </b>
        </Modal.Title>
    ) : (
        <Modal.Title>
            {drugTitleType}{' '}
            <b style={{color: 'blue'}}>
                <i>{drugName}</i>
            </b>
            <span> for </span>
            <b style={{backgroundColor: 'yellow'}}>{fullName}</b>
        </Modal.Title>
    );

    const otcAlert =
        otc && drugInfo.Id !== null ? (
            <Form.Group as={Row} controlId="otc-alert">
                <Form.Label column sm="2" style={{userSelect: 'none'}}>
                    <span style={{color: 'red'}}>
                        <b>OTC Warning</b>
                    </span>
                </Form.Label>

                <Col sm="9">
                    <Alert variant="danger">
                        <span style={{color: 'red'}}>
                            <b>CAUTION:</b>
                        </span>{' '}
                        Changes to this OTC medicine will affect <b>ALL</b> clients!
                    </Alert>
                </Col>
            </Form.Group>
        ) : (
            <></>
        );

    return (
        <Modal backdrop="static" centered onEntered={() => textInput?.current?.focus()} show={show} size="lg">
            <Modal.Header closeButton>{modalTitle}</Modal.Header>

            <Modal.Body>
                <Form>
                    {otcAlert}

                    <Form.Group as={Row}>
                        <Form.Label column sm="2" style={{userSelect: 'none'}}>
                            Drug Name
                        </Form.Label>

                        <Col sm="4">
                            <Form.Control
                                tabIndex={1}
                                className={drugInfo.Drug !== '' ? '' : 'is-invalid'}
                                ref={textInput}
                                type="text"
                                value={drugInfo.Drug}
                                name="Drug"
                                onChange={(e) => handleOnChange(e)}
                                required
                            />
                            <div className="invalid-feedback">Drug Name cannot be blank.</div>
                        </Col>

                        <Form.Label column sm="1" style={{userSelect: 'none'}}>
                            Strength
                        </Form.Label>

                        <Col sm="2">
                            <Form.Control
                                tabIndex={2}
                                type="text"
                                value={drugInfo.Strength ? drugInfo.Strength : ''}
                                placeholder="e.g. 100 MG TABS"
                                name="Strength"
                                onChange={(e) => handleOnChange(e)}
                            />
                        </Col>
                    </Form.Group>

                    <Form.Group as={Row}>
                        <Form.Label column sm="2" style={{userSelect: 'none'}}>
                            Other Names
                        </Form.Label>

                        <Col sm="9">
                            <Form.Control
                                type="text"
                                tabIndex={-1}
                                value={drugInfo.OtherNames}
                                placeholder="Other names for the drug"
                                name="OtherNames"
                                onChange={(e) => handleOnChange(e)}
                            />
                        </Col>
                    </Form.Group>

                    <Form.Group as={Row}>
                        <Form.Label column sm="2" style={{userSelect: 'none'}}>
                            Active
                        </Form.Label>

                        <Col sm="1">
                            <Button size="sm" id={`medicine-active-checkbox-${drugInfo.Id}`} variant="outline-light">
                                <span role="img" aria-label="active">
                                    <Form.Check
                                        tabIndex={-1}
                                        style={{transform: 'scale(2)'}}
                                        checked={drugInfo.Active}
                                        onChange={(e) => handleOnChange(e)}
                                        name="Active"
                                    />
                                </span>
                            </Button>
                        </Col>
                        <Col sm="9">
                            {!drugInfo.Active && (
                                <>
                                    <span style={{fontWeight: 'bold'}}>{drugInfo.Drug}</span> will not show in the
                                    medicine dropdown
                                </>
                            )}
                        </Col>
                    </Form.Group>

                    <Form.Group as={Row} controlId="drug-Directions">
                        <Form.Label column sm="2" style={{userSelect: 'none'}}>
                            Directions
                        </Form.Label>

                        <Col sm="9">
                            <Form.Control
                                tabIndex={3}
                                as="textarea"
                                rows={2}
                                value={drugInfo.Directions ? drugInfo.Directions : ''}
                                placeholder="e.g. Take 1 tablet at bedtime"
                                name="Directions"
                                onChange={(e) => handleOnChange(e)}
                            />
                        </Col>
                    </Form.Group>

                    {!otc && (
                        <Form.Group as={Row} controlId="otc-drug-Notes">
                            <Form.Label column sm="2" style={{userSelect: 'none'}}>
                                Notes
                            </Form.Label>

                            <Col sm="9">
                                <Form.Control
                                    tabIndex={4}
                                    as="textarea"
                                    rows={3}
                                    value={(drugInfo && drugInfo.Notes) || ''}
                                    name="Notes"
                                    onChange={(e) => handleOnChange(e)}
                                />
                            </Col>
                        </Form.Group>
                    )}

                    <Form.Group as={Row} controlId="drug-barcode">
                        <Form.Label column sm="2" style={{userSelect: 'none'}}>
                            Barcode
                        </Form.Label>

                        <Col sm="9">
                            <Form.Control
                                tabIndex={5}
                                type="text"
                                value={drugInfo.Barcode ? drugInfo.Barcode : ''}
                                name="Barcode"
                                onChange={(e) => handleOnChange(e)}
                            />
                        </Col>
                    </Form.Group>

                    {!otc && drugInfo && (
                        <Form.Group as={Row}>
                            <Form.Label column sm="2" style={{userSelect: 'none'}}>
                                <span className={isFillDateValid() ? '' : 'is-invalid'}>Fill Date</span>
                                <div className="invalid-feedback">Invalid Fill Date</div>
                            </Form.Label>
                            <Form.Label column sm="1" style={{userSelect: 'none'}}>
                                Month
                            </Form.Label>
                            <Col sm="2">
                                <Form.Control
                                    tabIndex={6}
                                    className={
                                        drugInfo.FillDateMonth?.length === 0
                                            ? ''
                                            : isMonthValid(drugInfo.FillDateMonth as string)
                                            ? ''
                                            : 'is-invalid'
                                    }
                                    type="text"
                                    value={drugInfo.FillDateMonth}
                                    name="FillDateMonth"
                                    onChange={(e) => handleOnChange(e)}
                                ></Form.Control>
                                <div className="invalid-feedback">Invalid Month</div>
                            </Col>
                            <Form.Label column sm="1" style={{userSelect: 'none'}}>
                                Day
                            </Form.Label>
                            <Col sm="2">
                                <Form.Control
                                    tabIndex={7}
                                    className={
                                        drugInfo.FillDateDay === ''
                                            ? ''
                                            : isDayValid(
                                                  drugInfo.FillDateDay as string,
                                                  drugInfo.FillDateMonth as string
                                              )
                                            ? ''
                                            : 'is-invalid'
                                    }
                                    type="text"
                                    value={drugInfo.FillDateDay}
                                    name="FillDateDay"
                                    onChange={(e) => handleOnChange(e)}
                                />
                                <div className="invalid-feedback">Invalid Day</div>
                            </Col>
                            <Form.Label column sm="1" style={{userSelect: 'none'}}>
                                Year
                            </Form.Label>
                            <Col sm={2}>
                                <Form.Control
                                    tabIndex={8}
                                    className={
                                        drugInfo.FillDateYear === ''
                                            ? ''
                                            : isYearValid(drugInfo.FillDateYear as string, false)
                                            ? ''
                                            : 'is-invalid'
                                    }
                                    type="text"
                                    value={drugInfo.FillDateYear}
                                    name="FillDateYear"
                                    onChange={(e) => handleOnChange(e)}
                                />
                                <div className="invalid-feedback">Invalid Year</div>
                            </Col>
                        </Form.Group>
                    )}
                </Form>
            </Modal.Body>

            <Modal.Footer>
                <Button onClick={() => handleHide('cancel')} variant="secondary">
                    Cancel
                </Button>
                <Button
                    disabled={!canSave}
                    onClick={() => handleHide('save')}
                    variant={otc && drugTitleType === 'Edit ' ? 'danger' : 'primary'}
                >
                    Save changes
                </Button>
                {allowDelete && drugInfo.Id && !otc && !drugInfo.Active && (
                    <TooltipContainer tooltip={'Permantly Delete Medicine'} placement="right">
                        <Button onClick={() => handleHide('delete')} variant="danger">
                            Delete
                        </Button>
                    </TooltipContainer>
                )}
            </Modal.Footer>
        </Modal>
    );
};

export default MedicineEdit;
