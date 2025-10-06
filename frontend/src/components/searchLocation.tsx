import { useState, useRef } from "react";
import { useApi } from "../hooks/useApi";

export interface ILocation {
    formatted: string;
    place_id: string;
    lat: number;
    lon: number;
}

interface SearchLocationProps {
    onSelectLocation: (location: ILocation) => void;
}

export const SearchLocation = ({ onSelectLocation }: SearchLocationProps) => {
    const [query, setQuery] = useState("");
    const { sendRequest, loading, error } = useApi();
    const [results, setResults] = useState<any[]>([]);
    const [selectedLocation, setSelectedLocation] = useState<ILocation | null>(null);
    const debounceRef = useRef<number | null>(null);

    const handleSearch = async () => {
        if (!query) return;

        try {
            const data = await sendRequest(`/api/geoapify/recommendation?query=${query}`, "GET");
            console.log(data)
            if (data && data.features) {
                setResults(data.features);
            }
        } catch (error) {
            console.error("Error fetching location data:", error);
        }
    };

    const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setQuery(e.target.value);
        if(debounceRef.current) clearTimeout(debounceRef.current);
        if (e.target.value.length > 2) {
            debounceRef.current = setTimeout(() => {
                handleSearch();
            }, 500);
        }
        else {
            setResults([]);
        }
    };

    const handleLocationSelect = (location: any) => () => {
        const loc: ILocation = {
            formatted: location.properties.formatted,
            place_id: location.properties.place_id,
            lat: location.geometry.coordinates[1],
            lon: location.geometry.coordinates[0]
        }
        setSelectedLocation(loc);
        onSelectLocation(loc);
        setQuery(location.properties.formatted);
        setResults([]);
    };

    return (
        <div>
            <input 
                className="border p-2 rounded w-64"
                type="text"
                value={query}
                onChange={handleOnChange}
                placeholder="Search location..."
            />

            {error && <p className="text-red-500 mt-2">Error: {error}</p>}

            <ul className="mt-4">
                {results.map((result) => (
                    <li 
                    key={result.properties.place_id} 
                    className="border-b py-2 cursor-pointer hover:bg-gray-100"
                    onClick={handleLocationSelect(result)}
                >
                        {result.properties.formatted}
                    </li>
                ))}
            </ul>

        </div>
    )

}

