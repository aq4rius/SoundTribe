// client/src/pages/AllArtists.tsx

import React, { useState, useEffect, useMemo, useRef } from "react";
import { debounce } from "lodash";
import { searchArtistProfiles } from "../services/artistProfile";
import { getAllGenres } from "../services/genre";
import { ArtistProfile, Genre, ArtistFilterType } from "../types";
import ArtistCard from "../components/artists/ArtistCard";
import Pagination from "../components/common/Pagination";

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
	if (error) return <div className="text-red-500">{error}</div>;

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
					<div className="bg-white p-6 rounded-lg shadow sticky top-4">
						<h3 className="text-lg font-semibold mb-4">Filters</h3>

						{/* Search Input */}
						<div className="space-y-4">
							<input
								type="text"
								placeholder="Search artists..."
								value={filters.searchTerm}
								onChange={(e) =>
									handleFilterChange("searchTerm", e.target.value)
								}
								className="w-full px-3 py-2 border rounded"
							/>
						</div>

						{/* Genre Filter */}
						<div className="mb-4">
							<h4 className="font-medium mb-2">Genres</h4>
							{genres.map((genre) => (
								<label key={genre._id} className="flex items-center mb-2">
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
										className="mr-2"
									/>
									{genre.name}
								</label>
							))}
						</div>

						{/* Experience Range */}
						<div className="mb-4">
							<h4 className="font-medium mb-2">Minimum Experience (years)</h4>
							<input
								type="number"
								value={filters.experienceMin}
								onChange={(e) =>
									handleFilterChange("experienceMin", Number(e.target.value))
								}
								className="w-full px-3 py-2 border rounded"
								min="0"
							/>
						</div>

						{/* Rate Range */}
						<div className="mb-4">
							<h4 className="font-medium mb-2">Hourly Rate Range ($)</h4>
							<div className="flex gap-2">
								<input
									type="number"
									value={filters.rateMin}
									onChange={(e) =>
										handleFilterChange("rateMin", Number(e.target.value))
									}
									className="w-1/2 px-3 py-2 border rounded"
									min="0"
									placeholder="Min"
								/>
								<input
									type="number"
									value={filters.rateMax}
									onChange={(e) =>
										handleFilterChange("rateMax", Number(e.target.value))
									}
									className="w-1/2 px-3 py-2 border rounded"
									min="0"
									placeholder="Max"
								/>
							</div>
						</div>

						{/* Location Filter */}
						<div className="mb-4">
							<h4 className="font-medium mb-2">Location</h4>
							<input
								type="text"
								value={filters.location}
								onChange={(e) => handleFilterChange("location", e.target.value)}
								className="w-full px-3 py-2 border rounded"
								placeholder="Enter location"
							/>
						</div>

						<button
							onClick={handleResetFilters}
							className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
						>
							Reset Filters
						</button>
					</div>
				</div>

				{/* Artists Grid with Pagination */}
				<div className="flex-1">
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
						{artists.map((artist) => (
							<ArtistCard key={artist._id} artist={artist} mode="compact" />
						))}
					</div>

					<Pagination
						currentPage={currentPage}
						totalPages={totalPages}
						onPageChange={handlePageChange}
					/>
				</div>
			</div>
		</div>
	);
};

export default AllArtists;
