import {DesignCarousel} from "@src/components/app/router/design-picker/design-carousel/DesignCarousel";
import {useApiDesignSync} from "@src/components/app/router/design-picker/hooks/UseApiDesignSync";
import {Spinner} from "@src/components/ui/spinner";
import {useMyDesignsState, useOthersDesignsState} from "@src/store/hooks/UseDesignsState";
import {useEditingDesignState} from "@src/store/hooks/UseEditingDesignState";
import {useIsLoadingDesignsState} from "@src/store/hooks/UseIsLoadingDesignsState";
import {getNewFrame} from "@src/store/types/design/frame/Frame";
import {useHighBrowStore} from "@src/store/ZustandStore";
import {useCallback, useMemo, type FC} from "react";

export const DesignPicker: FC = () => {
	const [myDesigns] = useMyDesignsState();
	const [othersDesigns] = useOthersDesignsState();
	const [, setEditingDesign] = useEditingDesignState();
	const [isLoadingDesigns] = useIsLoadingDesignsState();

	const showLoadingSpinner = useMemo(() => {
		return isLoadingDesigns && myDesigns.length === 0 && othersDesigns.length === 0 && window.navigator.onLine;
	}, [isLoadingDesigns, myDesigns.length, othersDesigns.length]);

	const setAudioMode = useHighBrowStore(state => state.setAudioMode);

	const onCreateNewDesign = useCallback(() => {
		setEditingDesign({
			isMine: true,
			isNew: true,
			createdBy: "",
			frames: [getNewFrame()],
			name: "",
		});
	}, [setEditingDesign]);

	const enableAudioMode = useCallback(() => {
		setAudioMode(true);
	}, [setAudioMode]);

	useApiDesignSync();

	return (
		<main className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center w-full">
			<header className="mb-8 text-center">
				<h1 className="text-4xl font-extrabold text-white tracking-tight mb-2">Bright Idea</h1>
				<p className="text-lg text-gray-400">Create designs and animations for your helmet visor LEDs</p>
			</header>
			<section className="flex flex-col items-center gap-6 w-full">
				<div className="w-full flex flex-col items-center gap-4">
					<h2 className="text-2xl font-bold text-white">My Designs</h2>

					{!showLoadingSpinner && myDesigns.length === 0 && (
						<div className="text-center text-gray-400">
							<p className="mb-4">No designs found. Create a new design to get started!</p>
						</div>
					)}

					{showLoadingSpinner && <Spinner />}

					<DesignCarousel designs={myDesigns} />
				</div>

				<div className="w-full flex flex-col items-center gap-4">
					<h2 className="text-2xl font-bold text-white">Downloaded Designs</h2>
					{!showLoadingSpinner && othersDesigns.length === 0 && (
						<div className="text-center text-gray-400">
							<p className="mb-4">
								Nobody has downloaded this design yet :-(<br></br> Be the first!
							</p>
						</div>
					)}

					<DesignCarousel designs={othersDesigns} />
				</div>

				<button
					className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition cursor-pointer"
					onClick={onCreateNewDesign}
				>
					Create New Design
				</button>

				<button
					className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition cursor-pointer"
					onClick={enableAudioMode}
				>
					Audio Mode
				</button>
			</section>
		</main>
	);
};
