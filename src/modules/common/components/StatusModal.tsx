import { AlertTriangle, CheckCircle, Info, X } from 'lucide-react';
import { useEffect, useState } from 'react';

export type StatusModalType = 'success' | 'error' | 'info';

interface StatusModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    message: string;
    type?: StatusModalType;
    actionText?: string;
    onAction?: () => void;
}

export const StatusModal = ({
    isOpen,
    onClose,
    title,
    message,
    type = 'info',
    actionText = "Okay",
    onAction
}: StatusModalProps) => {
    const [show, setShow] = useState(isOpen);

    useEffect(() => {
        setShow(isOpen);
    }, [isOpen]);

    if (!show) return null;

    const getIcon = () => {
        switch (type) {
            case 'success':
                return <CheckCircle size={32} />;
            case 'error':
                return <AlertTriangle size={32} />;
            default:
                return <Info size={32} />;
        }
    };

    const getColors = () => {
        switch (type) {
            case 'success':
                return 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400';
            case 'error':
                return 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400';
            default:
                return 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400';
        }
    };

    const getButtonColor = () => {
        switch (type) {
            case 'success':
                return 'bg-green-600 hover:bg-green-700 shadow-green-500/30';
            case 'error':
                return 'bg-red-600 hover:bg-red-700 shadow-red-500/30';
            default:
                return 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/30';
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose}>
            <div
                className="bg-white dark:bg-[#1E2024] rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden transform transition-all scale-100 animate-in zoom-in-95 duration-200 border border-slate-100 dark:border-white/5"
                onClick={e => e.stopPropagation()}
            >
                <div className="p-6 text-center relative">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors rounded-full hover:bg-slate-100 dark:hover:bg-white/5"
                    >
                        <X size={18} />
                    </button>

                    <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-5 ${getColors()} ring-4 ring-white dark:ring-[#1E2024] shadow-sm`}>
                        {getIcon()}
                    </div>

                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                        {title}
                    </h3>

                    <p className="text-slate-500 dark:text-slate-400 mb-8 leading-relaxed text-sm">
                        {message}
                    </p>

                    <button
                        onClick={() => {
                            if (onAction) onAction();
                            onClose();
                        }}
                        className={`w-full py-3.5 px-6 font-bold text-white rounded-xl shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2 ${getButtonColor()}`}
                    >
                        {actionText}
                    </button>
                </div>
            </div>
        </div>
    );
};
