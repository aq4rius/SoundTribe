// client/src/pages/AllArtists.tsx

import React, { useState, useEffect, useMemo, useRef } from "react";
import { debounce } from "lodash";
import { searchArtistProfiles } from "../services/artistProfile";
import { getAllGenres } from "../services/genre";
import { ArtistProfile, Genre, ArtistFilterType } from "../types";
import ArtistCard from "../components/artists/ArtistCard";
import Pagination from "../components/common/Pagination";
import ErrorAlert from '../components/common/ErrorAlert';

const ITEMS_PER_PAGE = 9;

const DEFAULT_FILTERS = {
	searchTerm: "",
	selectedGenres: [] as string[],
	instruments: [] as string[],
	experienceMin: 0,
	rateMin: 0,
	rateMax: 1000,
	location: "",
}; 

const AllArtists: React.FC = () => {
	const [artists, setArtists] = useState<ArtistProfile[]>([]);
	const [genres, setGenres] = useState<Genre[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [currentPage, setCurrentPage] = useState(1);
	const [totalItems, setTotalItems] = useState(0);
	const abortControllerRef = useRef<AbortController | null>(null);

	const [filters, setFilters] = useState(DEFAULT_FILTERS);

	useEffect(() => {
		const fetchGenres = async () => {
			try {
				const genresData = await getAllGenres();
				setGenres(genresData);
			} catch (error: unknown) {
				console.error(
					"Failed to fetch genres:",
					error instanceof Error ? error.message : "Unknown error"
				);
			}
		};
		fetchGenres();
	}, []);

	const fetchArtists = useMemo(
		() =>
			debounce(async (currentFilters: ArtistFilterType, page: number) => {
				if (abortControllerRef.current) {
					abortControllerRef.current.abort();
				}

				abortControllerRef.current = new AbortController();

				setIsLoading(true);
				try {
					const artistsResponse = await searchArtistProfiles(
						{
							...currentFilters,
							page,
							limit: ITEMS_PER_PAGE,
						},
						abortControllerRef.current.signal
					);

					setArtists(artistsResponse.data || []);
					setTotalItems(artistsResponse.total || 0);
				} catch (error: unknown) {
					if (error instanceof Error && error.name !== "AbortError") {
						setError("Failed to load artists");
					}
				} finally {
					setIsLoading(false);
				}
			}, 300),
		[]
	);

	useEffect(() => {
		fetchArtists(filters, currentPage);

		return () => {
			fetchArtists.cancel();
			if (abortControllerRef.current) {
				abortControllerRef.current.abort();
			}
		};
	}, [filters, currentPage, fetchArtists]);

	const handleFilterChange = (key: string, value: any) => {
		setFilters((prev) => ({
			...prev,
			[key]: value,
		}));
		setCurrentPage(1);
	};

	const handlePageChange = (page: number) => {
		setCurrentPage(page);
	};

	if (isLoading) return <div>Loading...</div>;
	if (error) return <ErrorAlert message={error} />;

	const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

	const handleResetFilters = () => {
		setFilters(DEFAULT_FILTERS);
		setCurrentPage(1);
	};

	return (
		<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
			<h1 className="text-3xl font-bold mb-8">All Artists</h1>
			<div className="flex flex-col md:flex-row gap-6">
				{/* Filter Sidebar */}
				<div className="w-full md:w-64 flex-shrink-0">
					<div className="card bg-base-100 p-6 rounded-lg shadow sticky top-4">
						<h2 className="text-lg font-semibold mb-4">Filters</h2>
						<div className="space-y-4">
							{/* Search Input */}
							<div className="form-control">
								<input
									type="text"
									placeholder="Search artists..."
									value={filters.searchTerm}
									onChange={(e) =>
										handleFilterChange("searchTerm", e.target.value)
									}
									className="input input-bordered w-full"
								/>
							</div>
							{/* Genre Filter */}
							<div className="form-control">
								<label className="label">
									<span className="label-text">Genres</span>
								</label>
								<div className="space-y-1">
									{genres.map((genre) => (
										<label key={genre._id} className="flex items-center gap-2">
											<input
												type="checkbox"
												checked={filters.selectedGenres.includes(genre._id)}
												onChange={() => {
													const newGenres = filters.selectedGenres.includes(
														genre._id
													)
														? filters.selectedGenres.filter(
																(id) => id !== genre._id
														  )
														: [...filters.selectedGenres, genre._id];
													handleFilterChange("selectedGenres", newGenres);
												}}
												className="checkbox checkbox-sm"
											/>
											<span>{genre.name}</span>
										</label>
									))}
								</div>
							</div>
							{/* Experience Range */}
							<div className="form-control">
								<label className="label">
									<span className="label-text">Minimum Experience (years)</span>
								</label>
								<input
									type="number"
									value={filters.experienceMin}
									onChange={(e) =>
										handleFilterChange("experienceMin", Number(e.target.value))
									}
									className="input input-bordered w-full"
									min="0"
								/>
							</div>
							{/* Rate Range */}
							<div className="form-control">
								<label className="label">
									<span className="label-text">Hourly Rate Range ($)</span>
								</label>
								<div className="flex gap-2">
									<input
										type="number"
										value={filters.rateMin}
										onChange={(e) =>
											handleFilterChange("rateMin", Number(e.target.value))
										}
										className="input input-bordered w-1/2"
										min="0"
										placeholder="Min"
									/>
									<input
										type="number"
										value={filters.rateMax}
										onChange={(e) =>
											handleFilterChange("rateMax", Number(e.target.value))
										}
										className="input input-bordered w-1/2"
										min="0"
										placeholder="Max"
									/>
								</div>
							</div>
							{/* Location Filter */}
							<div className="form-control">
								<label className="label">
									<span className="label-text">Location</span>
								</label>
								<input
									type="text"
									value={filters.location}
									onChange={(e) =>
										handleFilterChange("location", e.target.value)
									}
									className="input input-bordered w-full"
									placeholder="Enter location"
								/>
							</div>
							<button
								onClick={handleResetFilters}
								className="btn btn-outline btn-sm w-full mt-2"
							>
								Reset Filters
							</button>
						</div>
					</div>
				</div>
				{/* Artists Grid with Pagination */}
				<div className="flex-1">
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
						{artists.map((artist) => (
							<ArtistCard key={artist._id} artist={artist} mode="compact" />
						))}
					</div>
					<div className="mt-6">
						<Pagination
							currentPage={currentPage}
							totalPages={totalPages}
							onPageChange={handlePageChange}
						/>
					</div>
				</div>
			</div>
		</div>
	);
};

export default AllArtists;
