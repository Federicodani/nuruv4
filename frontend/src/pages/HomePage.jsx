import Hero from '../components/home/Hero';
import FeaturedCategories from '../components/home/FeaturedCategories';
import FeaturedProfessionals from '../components/home/FeaturedProfessionals';
import FeaturedMaterials from '../components/home/FeaturedMaterials';
import FeaturedProjects from '../components/home/FeaturedProjects';
import NuruElectricalsPromo from '../components/home/NuruElectricalsPromo';

const HomePage = () => {
  return (
    <div>
      <Hero />
      <FeaturedCategories />
      <FeaturedProfessionals />
      <FeaturedMaterials />
      <FeaturedProjects />
      <NuruElectricalsPromo />
    </div>
  );
};

export default HomePage;
