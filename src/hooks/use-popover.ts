import React, { useRef, useState, useCallback } from "react";

interface PopoverController<T> {
	anchorRef: React.MutableRefObject<T | null>;
	handleOpen: () => void;
	handleClose: () => void;
	handleToggle: () => void;
	open: boolean;
}

export function usePopover<T = HTMLElement>(): PopoverController<T> {
	const anchorRef = useRef<T | null>(null);
	const [open, setOpen] = useState<boolean>(false);

	const handleOpen = useCallback((): void => {
		setOpen(true);
	}, []);

	const handleClose = useCallback((): void => {
		setOpen(false);
	}, []);

	const handleToggle = useCallback((): void => {
		setOpen((prevState) => !prevState);
	}, []);

	return { anchorRef, handleClose, handleOpen, handleToggle, open };
}
