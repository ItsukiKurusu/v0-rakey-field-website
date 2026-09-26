import { ServicePage } from "@/components/service/ServicePage"
import { SERVICE_PAGES } from "@/lib/service-pages"

export default function RentalCarPage() {
  return <ServicePage data={SERVICE_PAGES["rental-car"]} />
}
