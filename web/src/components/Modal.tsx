import React, { FC, ReactNode } from 'react';
import '../styles/Modal.css';

interface ModalProps {
    children?: ReactNode;
    open: boolean;
    onConfirm?: () => void;
    onCancel?: () => void;
    title: string;
}

const Modal: FC<ModalProps> = ({
    children,
    open,
    title,
    onCancel,
    onConfirm,
}) => {
    if (!open) return null;

    return (
        <div className="modal-container">
            <div className="modal-card">
                <h2>{title}</h2>
                {children}
                <div className="button-group">
                    <button onClick={onCancel}>Cancel</button>
                    <button className="create-button" onClick={onConfirm}>
                        Confirm
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Modal;
