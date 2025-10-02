import type {RGBColour, Grid, AnimationFrame} from "@shared/types/AnimationFrame";
import {ColourPicker} from "@src/components/app/router/design-editor/colour-picker/ColourPicker";
import {FrameEditor} from "@src/components/app/router/design-editor/frame-editor/FrameEditor";
import {FrameSelector} from "@src/components/app/router/design-editor/frame-selector/FrameSelector";
import {useDesignsState} from "@src/store/hooks/UseDesignsState";
import {useEditingDesignIdState} from "@src/store/hooks/UseEditingDesignIdState";
import {getNewFrame} from "@src/store/types/design/frame/Frame";
import {useCallback, useEffect, useMemo, useRef, useState, type FC} from "react";
import type {EditingDesign} from "@src/store/types/design/Design";
import {daftPunkSongs} from "@src/components/app/router/design-editor/constants/DaftPunkSongs";
import {InputWithTypingPlaceholder} from "@src/components/app/router/design-editor/components/InputWIthTypingPlaceholder";
import {songwriters} from "@src/components/app/router/design-editor/constants/Songwriters";
import {Tooltip, TooltipContent, TooltipTrigger} from "@src/components/ui/tooltip";
import {CautionDialog} from "@src/components/app/router/design-editor/components/CautionDialog";
import {Turnstile, type TurnstileInstance} from "@marsidev/react-turnstile";
import {apiCreateDesign} from "@src/lib/api/CreateDesign";
import {ToastContainer, toast} from "react-toastify";

interface Props {
	designId: string;
}

export const DesignEditor: FC<Props> = ({designId}) => {
	const [designs] = useDesignsState();
	const [selectedColour, setSelectedColour] = useState<RGBColour>([255, 255, 255]);
	const [selectedFrameIndex, setSelectedFrameIndex] = useState(0);
	const [, setEditingDesignId] = useEditingDesignIdState();
	const turnstyleRef = useRef<TurnstileInstance>(null);

	// Local cache of the design being edited
	const [design, setDesign] = useState<EditingDesign>(designs.find(d => d.id === designId)!);

	useEffect(() => {
		const foundDesign = designs.find(d => d.id === designId);
		if (!foundDesign) throw new Error("Design not found");

		setDesign(foundDesign);
	}, [designId, designs]);

	const selectedFrame = useMemo(() => {
		return design.frames[selectedFrameIndex];
	}, [design.frames, selectedFrameIndex]);

	const updateDesign = useCallback(
		(changes: Partial<EditingDesign>) => {
			const updatedDesign = {...design, ...changes};
			setDesign(updatedDesign);
		},
		[design, setDesign],
	);

	const onCellClick = useCallback(
		(rowIndex: number, colIndex: number) => {
			// Update the selected frame with the new colour
			const updatedGrid: Grid = selectedFrame.grid.map((row, rIdx) =>
				row.map((cell, cIdx) =>
					rIdx === rowIndex && cIdx === colIndex
						? [...selectedColour] // Update the clicked cell with the selected colour
						: cell,
				),
			);

			// designs is an array of design objects, each with a frames array, update the designs array
			const updatedFrame: AnimationFrame = {
				...selectedFrame,
				grid: updatedGrid,
			};

			updateDesign({
				frames: design.frames.map((frame, idx) => (idx === selectedFrameIndex ? updatedFrame : frame)),
			});
		},
		[design.frames, selectedColour, selectedFrame, selectedFrameIndex, updateDesign],
	);

	const onFrameAdd = useCallback(
		(position: "Start" | "End") => {
			const newFrame: AnimationFrame = getNewFrame();

			const updatedFrames = position === "Start" ? [newFrame, ...design.frames] : [...design.frames, newFrame];

			const updatedDesign = {
				...design,
				frames: updatedFrames,
			};

			setDesign(updatedDesign);
			setSelectedFrameIndex(position === "Start" ? 0 : updatedFrames.length - 1);
		},
		[design],
	);

	const onDurationChange = useCallback(
		(duration: number) => {
			const updatedFrame: AnimationFrame = {
				...selectedFrame,
				duration,
			};

			const updatedDesign = {
				...design,
				frames: design.frames.map((frame, idx) => (idx === selectedFrameIndex ? updatedFrame : frame)),
			};

			setDesign(updatedDesign);
		},
		[design, selectedFrame, selectedFrameIndex, setDesign],
	);

	const isValid = useMemo(() => {
		return design.name.trim().length > 0 && design.createdBy.trim().length > 0 && design.frames.length > 0;
	}, [design]);

	const onDialogConfirm = useCallback(() => {
		(async () => {
			if (!isValid || !turnstyleRef.current) return;

			const turnstileToken = turnstyleRef.current.getResponse();
			if (!turnstileToken) {
				alert("Please complete the CAPTCHA challenge before publishing.");
				return;
			}

			const loadingId = toast.loading("Publishing design...", {theme: "dark", autoClose: false});
			try {
				await apiCreateDesign({
					name: design.name,
					createdBy: design.createdBy,
					design: design.frames,
					turnstileToken,
				});

				toast.update(loadingId, {
					render: "Design published successfully!",
					type: "success",
					isLoading: false,
					autoClose: 3000,
				});
				setEditingDesignId(undefined);
			} catch {
				toast.update(loadingId, {
					render: "Failed to publish design. Please try again.",
					type: "error",
					isLoading: false,
					autoClose: 3000,
				});
				return;
			}
		})();
	}, [design.createdBy, design.frames, design.name, isValid, setEditingDesignId]);

	return (
		<main className="min-h-screen bg-neutral-950 flex text-white w-full py-4 flex-col justify-between items-stretch">
			<nav className="flex items-center w-full justify-center">
				<div className="flex flex-col mb-4 gap-4">
					<div className="flex items-center justify-between w-full flex-row gap-5">
						<div className="flex flex-col gap-2 items-center">
							<InputWithTypingPlaceholder
								defaultPlaceholder={"Give me a name..."}
								placeholders={daftPunkSongs}
								value={design.name}
								onChange={e => updateDesign({name: e.target.value})}
							/>

							<hr className="border-t border-gray-400 w-[50%]" />

							<div className="flex flex-row text-xl gap-[1ch]">
								<p className="text-gray-400">By </p>
								<InputWithTypingPlaceholder
									defaultPlaceholder={"Daft Punk"}
									placeholders={songwriters}
									value={design.createdBy}
									onChange={e => updateDesign({createdBy: e.target.value})}
									className="text-xl"
								/>
							</div>
						</div>
					</div>
				</div>
			</nav>

			<div className="top-0 bottom-0 left-0 z-10 absolute min-w-52 h-full">
				<div className="flex items-center justify-center h-full">
					<ColourPicker selectedColour={selectedColour} setSelectedColour={setSelectedColour} />
				</div>
			</div>

			<FrameEditor frame={selectedFrame} onCellClick={onCellClick} onDurationChange={onDurationChange} />

			<div className="flex flex-col gap-4">
				<FrameSelector
					frames={design.frames}
					selectedFrameIndex={selectedFrameIndex}
					onFrameSelect={setSelectedFrameIndex}
					onFrameAdd={onFrameAdd}
				/>

				<div className="items-center flex justify-center gap-4">
					<button
						className="hover:cursor-pointer justify-self-end bg-red-500 hover:bg-red-600 transition-colors rounded py-2 px-4"
						onClick={() => setEditingDesignId(undefined)}
					>
						Abort
					</button>

					<Tooltip>
						<TooltipTrigger asChild>
							<CautionDialog
								title={"Are you sure?"}
								description="This will publish your design to the repository and make it available for all to see. You will
						still be able to edit it later."
								onConfirm={onDialogConfirm}
							>
								<button
									className="disabled:cursor-not-allowed hover:cursor-pointer justify-self-end bg-blue-500 hover:bg-blue-600 transition-colors rounded py-2 px-4 disabled:bg-blue-400"
									disabled={!isValid}
								>
									Publish
								</button>
							</CautionDialog>
						</TooltipTrigger>
						<TooltipContent>
							Make sure you have given your design a name, author, and at least one frame before
							publishing!
						</TooltipContent>
					</Tooltip>
				</div>
			</div>

			<Turnstile ref={turnstyleRef} siteKey={import.meta.env.VITE_CLOUDFLARE_TURNSTILE_SITE_KEY} />
			<ToastContainer />
		</main>
	);
};
