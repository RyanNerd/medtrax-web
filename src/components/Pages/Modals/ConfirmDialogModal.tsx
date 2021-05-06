import React, {useState} from 'reactn';
import Modal, {ModalProps} from 'react-bootstrap/Modal';
import Button from "react-bootstrap/Button";
import ModalHeader from "react-bootstrap/ModalHeader";
import {ModalBody, ModalFooter} from "react-bootstrap";
import {ReactChild, ReactChildren, useEffect} from "react";

interface IProps extends ModalProps {
    show: boolean
    body?: string | ReactChildren | ReactChild | JSX.Element[] | JSX.Element
    title?: string | ReactChildren | ReactChild | JSX.Element[] | JSX.Element
    onAnswer?: (a: boolean) => void
    yesButton?: JSX.Element
    noButton?: JSX.Element
    [key: string]: any
}

/**
 * ConfirmDialogModal - Uses composition instead of inheritance
 * @param props {IProps}
 */
const ConfirmDialogModal = (props: IProps) => {
    const {
        onAnswer,
        show,
        body,
        title,
        yesButton,
        noButton
    } = {...props}

    const [showModal, setShowModal] = useState(show);

    // Monitor changes to the show property
    useEffect(() => {
        setShowModal(show);
    }, [show]);

    /**
     * Handle when user clicks on the yes / no button
     * @param e {React.MouseEvent<HTMLElement>}
     * @param a {Boolean}
     */
    const handleClick = (e: React.MouseEvent<HTMLElement>, a: boolean) => {
        e.preventDefault();
        setShowModal(false);
        if (onAnswer) {
            onAnswer(a);
        }
    }

    /**
     * Generic AnswerButton
     * @param props {boolean}
     */
    const AnswerButton = (props: {a: boolean}) => {
        return (
            <Button
                onClick={(e) => handleClick(e, props.a)}
                variant={ props.a ? "primary" : "secondary"}
            >
                {props.a ? "Yes" : "No"}
            </Button>
        )
    }

    return (
        <Modal
            {...props}
            show = {showModal}
            backdrop = "static"
        >
            {title &&
                <ModalHeader>
                    {title}
                </ModalHeader>
            }

            <ModalBody>
                {body}
            </ModalBody>

            <ModalFooter>
                {yesButton ? yesButton : <AnswerButton a={true}/>}
                {noButton ? noButton : <AnswerButton a={false}/>}
            </ModalFooter>
        </Modal>
    )
}

export default ConfirmDialogModal;
