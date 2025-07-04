import React from "react";
import Marquee from "react-fast-marquee";
import assets from "../assets/assets";

const CarBrandsCarousel = () => {
  const brands = [
    { name: "Audi", logo: assets.Audi },
    { name: "BMW", logo: assets.BMW },
    { name: "Mercedes", logo: assets.Mercedes },
    { name: "Toyota", logo: assets.Dacia },
    { name: "Ford", logo: assets.Renault },
    { name: "Volkswagen", logo: assets.Peugeot },
    { name: "Porsche", logo: assets.Porsche },
    { name: "Lamborghini", logo: assets.Volkswagen },
    { name: "Ferrari", logo: assets.Maserati },
  ];

  return (
    <div className="bg-white py-6">
      <Marquee speed={50} gradient={false}>
        {brands.map((brand, index) => (
          <div key={index} className="mx-8">
            <img src={brand.logo} alt={brand.name} className="h-16 md:h-20 object-contain" />
          </div>
        ))}
      </Marquee>
    </div>
  );
};

export default CarBrandsCarousel;
