import { getTranslations } from "next-intl/server";

interface Review {
  id: string;
  name: string;
  rating: number;
  text: string;
  product: string | null;
}

interface Props {
  reviews: Review[];
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`w-4 h-4 ${star <= Math.round(rating) ? "text-amber-400" : "text-gray-200"}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export default async function ReviewsSection({ reviews }: Props) {
  const t = await getTranslations("reviews");

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-extrabold text-[#111827]">{t("heading")}</h2>
          <p className="text-[#6b7280] mt-2">{t("desc")}</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="bg-[#f6f8fb] border border-gray-100 rounded-2xl p-6 hover:shadow-md transition-shadow flex flex-col"
            >
              <svg className="w-7 h-7 text-[#c7092b]/20 mb-3" fill="currentColor" viewBox="0 0 24 24">
                <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
              </svg>

              <StarRating rating={review.rating} />

              <p className="text-sm text-[#6b7280] mt-3 flex-1 leading-relaxed">
                &ldquo;{review.text}&rdquo;
              </p>

              <div className="flex items-center gap-3 mt-4 pt-4 border-t border-gray-200">
                <div className="w-9 h-9 bg-[#1d2353] rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0">
                  {getInitials(review.name)}
                </div>
                <div>
                  <div className="text-sm font-bold text-[#111827]">{review.name}</div>
                  {review.product && (
                    <div className="text-[10px] text-[#6b7280] mt-0.5 truncate max-w-[150px]">
                      {review.product}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
