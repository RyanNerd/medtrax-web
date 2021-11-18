// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import DrugNameDropdown from 'components/Pages/Buttons/DrugNameDropdown';
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
    drugInfo: MedicineRecord;
    fullName?: string;
    onClose: (r: MedicineRecord | null) => void;
    show: boolean;
}

/**
 * Edit Modal for Medicine
 * @param {IProps} props Props for the component
 * @returns {JSX.Element | null}
 */
const MedicineEdit = (props: IProps): JSX.Element | null => {
    const {allowDelete = false, onClose, fullName} = props;

    const [drugInfo, setDrugInfo] = useState<MedicineRecord>(props.drugInfo);
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

    const [show, setShow] = useState(props.show);
    useEffect(() => {
        setShow(props.show);
    }, [props.show]);

    const [canSave, setCanSave] = useState(false);
    useEffect(() => {
        if (drugInfo?.Drug?.length > 0) setCanSave(document.querySelectorAll('.is-invalid')?.length === 0);
        else setCanSave(false);
    }, [drugInfo, setCanSave]);

    const drugInput = useRef<HTMLInputElement>(null);
    const strengthInput = useRef<HTMLInputElement>(null);

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

    // Short circuit render if there is no drugInfo record or the drugInfo object is empty
    if (drugInfo === null || Object.keys(drugInfo).length === 0) return null;

    const otc = drugInfo.OTC;
    const drugTitleType = drugInfo.Id ? 'Edit ' : ('Add ' as string);
    const drugName = drugInfo.Id || drugInfo?.Drug.length > 0 ? drugInfo.Drug : 'new drug';

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

    const otcAlert = (
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
    );

    const fillDateMonthValid =
        drugInfo.FillDateMonth === '' ? '' : isMonthValid(drugInfo.FillDateMonth as string) ? '' : 'is-invalid';

    const fillDateDayValid =
        drugInfo.FillDateDay === ''
            ? ''
            : isDayValid(drugInfo.FillDateDay as string, drugInfo.FillDateMonth as string)
            ? ''
            : 'is-invalid';

    const fillDateYearValid =
        drugInfo.FillDateYear === '' ? '' : isYearValid(drugInfo.FillDateYear as string, false) ? '' : 'is-invalid';

    // noinspection RequiredAttributes TS/Inspector thinks <Typeahead> requires ALL attributes when this is NOT so
    return (
        <Modal
            backdrop="static"
            centered
            onEntered={() => {
                drugInput?.current?.focus();
            }}
            show={show}
            size="lg"
        >
            <Modal.Header closeButton>{modalTitle}</Modal.Header>

            <Modal.Body>
                <Form>
                    {otc && drugInfo?.Id && !allowDelete ? otcAlert : null}

                    <Form.Group as={Row}>
                        <Form.Label column sm="2" style={{userSelect: 'none'}}>
                            Drug Name
                        </Form.Label>
                        <Col sm="6">
                            <div className={drugInfo.Drug !== '' ? '' : 'is-invalid'}>
                                <DrugNameDropdown
                                    onChange={(e) => setDrugInfo({...drugInfo, Drug: e.target.value})}
                                    onSelect={(s) => {
                                        setDrugInfo({...drugInfo, Drug: s});
                                        strengthInput?.current?.focus();
                                    }}
                                    initalValue={drugInfo.Drug}
                                    drugInputRef={drugInput}
                                />
                            </div>
                            <div className="invalid-feedback">Drug Name cannot be blank.</div>
                        </Col>

                        <Form.Label column sm="1" style={{userSelect: 'none'}}>
                            Strength
                        </Form.Label>
                        <Col sm="2">
                            <Form.Control
                                name="Strength"
                                onChange={(e) => handleOnChange(e)}
                                placeholder="e.g. 100 MG TABS"
                                ref={strengthInput}
                                tabIndex={2}
                                type="text"
                                value={drugInfo.Strength ? drugInfo.Strength : ''}
                            />
                        </Col>
                    </Form.Group>

                    <Form.Group as={Row}>
                        <Form.Label column sm="2" style={{userSelect: 'none'}}>
                            Other Names
                        </Form.Label>
                        <Col sm="9">
                            <Form.Control
                                name="OtherNames"
                                onChange={(e) => handleOnChange(e)}
                                placeholder="Other names for the drug"
                                tabIndex={-1}
                                type="text"
                                value={drugInfo.OtherNames}
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
                                        checked={drugInfo.Active}
                                        name="Active"
                                        onChange={(e) => handleOnChange(e)}
                                        style={{transform: 'scale(2)'}}
                                        tabIndex={-1}
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
                                as="textarea"
                                name="Directions"
                                onChange={(e) => handleOnChange(e)}
                                placeholder="e.g. Take 1 tablet at bedtime"
                                rows={2}
                                tabIndex={3}
                                value={drugInfo.Directions ? drugInfo.Directions : ''}
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
                                    as="textarea"
                                    name="Notes"
                                    onChange={(e) => handleOnChange(e)}
                                    rows={3}
                                    tabIndex={4}
                                    value={(drugInfo && drugInfo.Notes) || ''}
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
                                name="Barcode"
                                onChange={(e) => handleOnChange(e)}
                                tabIndex={5}
                                type="text"
                                value={drugInfo.Barcode ? drugInfo.Barcode : ''}
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
                                    className={fillDateMonthValid}
                                    name="FillDateMonth"
                                    onChange={(e) => handleOnChange(e)}
                                    tabIndex={6}
                                    type="text"
                                    value={drugInfo.FillDateMonth}
                                ></Form.Control>
                                <div className="invalid-feedback">Invalid Month</div>
                            </Col>
                            <Form.Label column sm="1" style={{userSelect: 'none'}}>
                                Day
                            </Form.Label>
                            <Col sm="2">
                                <Form.Control
                                    className={fillDateDayValid}
                                    name="FillDateDay"
                                    onChange={(e) => handleOnChange(e)}
                                    tabIndex={7}
                                    type="text"
                                    value={drugInfo.FillDateDay}
                                />
                                <div className="invalid-feedback">Invalid Day</div>
                            </Col>
                            <Form.Label column sm="1" style={{userSelect: 'none'}}>
                                Year
                            </Form.Label>
                            <Col sm={2}>
                                <Form.Control
                                    className={fillDateYearValid}
                                    name="FillDateYear"
                                    onChange={(e) => handleOnChange(e)}
                                    tabIndex={8}
                                    type="text"
                                    value={drugInfo.FillDateYear}
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
                {allowDelete && drugInfo.Id && !drugInfo.Active && (
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
