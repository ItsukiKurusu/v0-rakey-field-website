import { ServicePage } from "@/components/service/ServicePage"
import { SERVICE_PAGES } from "@/lib/service-pages"

export default function CarSalesPage() {
  return <ServicePage data={SERVICE_PAGES["car-sales"]} />
}
