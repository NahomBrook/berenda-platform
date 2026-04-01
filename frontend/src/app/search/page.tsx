import { searchListings } from "@/lib/api";

export default async function SearchPage({ searchParams }: any) {

  const listings = await searchListings(searchParams);

  return (
    <div className="p-8 grid grid-cols-4 gap-6">

      {listings.map((listing: any) => (
        <div key={listing.id} className="border rounded-xl overflow-hidden">

          <img src={listing.image} />

          <div className="p-4">
            <h3 className="font-semibold">{listing.title}</h3>
            <p className="text-gray-500">{listing.location}</p>
            <p className="font-bold">${listing.price}/night</p>
          </div>

        </div>
      ))}

    </div>
  );
}