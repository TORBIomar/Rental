import React, {
  createContext,
  useState,
  useContext,
  useRef,
  useEffect,
} from "react";
import { useNavigate, useLocation } from "react-router-dom";

const FloatingCarCard = ({ voiture }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Handlers for navigation
  const handleAcheter = () => {
    navigate(`/buycar/${voiture.id}`);
  };
  
  const handleLouer = () => {
    navigate(`/rentcar/${voiture.id}`);
  };

  // Check current route
  const isBuyRoute = location.pathname.startsWith('/buy');
  const isRentRoute = location.pathname.startsWith('/rent');

  // Utility function to merge classes
  const cn = (...classes) => {
    return classes.filter(Boolean).join(" ");
  };

  // Context for mouse enter state
  const MouseEnterContext = createContext(undefined);

  // Hook to use mouse enter context
  const useMouseEnter = () => {
    const context = useContext(MouseEnterContext);
    if (context === undefined) {
      throw new Error("useMouseEnter must be used within a MouseEnterProvider");
    }
    return context;
  };

  // Card Container Component
  const CardContainer = ({
    children,
    className,
    containerClassName,
  }) => {
    const containerRef = useRef(null);
    const [isMouseEntered, setIsMouseEntered] = useState(false);

    const handleMouseMove = (e) => {
      if (!containerRef.current) return;
      const { left, top, width, height } =
        containerRef.current.getBoundingClientRect();
      const x = (e.clientX - left - width / 2) / 25;
      const y = (e.clientY - top - height / 2) / 25;
      containerRef.current.style.transform = `rotateY(${x}deg) rotateX(${y}deg)`;
    };

    const handleMouseEnter = () => setIsMouseEntered(true);
    const handleMouseLeave = () => {
      if (!containerRef.current) return;
      setIsMouseEntered(false);
      containerRef.current.style.transform = `rotateY(0deg) rotateX(0deg)`;
    };

    return (
      <MouseEnterContext.Provider value={[isMouseEntered, setIsMouseEntered]}>
        <div
          className={cn(
            "py-10 flex items-center justify-center",
            containerClassName,
          )}
          style={{ perspective: "1000px" }}
        >
          <div
            ref={containerRef}
            onMouseEnter={handleMouseEnter}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className={cn(
              "flex items-center justify-center relative transition-all duration-200 ease-linear",
              className,
            )}
            style={{ transformStyle: "preserve-3d" }}
          >
            {children}
          </div>
        </div>
      </MouseEnterContext.Provider>
    );
  };

  // Card Body Component
  const CardBody = ({
    children,
    className,
  }) => {
    return (
      <div
        className={cn(
          "w-[320px] [transform-style:preserve-3d] [&>*]:[transform-style:preserve-3d]",
          className,
        )}
      >
        {children}
      </div>
    );
  };

  // Card Item Component
  const CardItem = ({
    as: Tag = "div",
    children,
    className,
    translateX = 0,
    translateY = 0,
    translateZ = 0,
    rotateX = 0,
    rotateY = 0,
    rotateZ = 0,
    ...rest
  }) => {
    const ref = useRef(null);
    const [isMouseEnter] = useMouseEnter();

    useEffect(() => {
      if (!ref.current) return;
      if (isMouseEnter) {
        ref.current.style.transform = `translateX(${translateX}px) translateY(${translateY}px) translateZ(${translateZ}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) rotateZ(${rotateZ}deg)`;
      } else {
        ref.current.style.transform = `translateX(0px) translateY(0px) translateZ(0px) rotateX(0deg) rotateY(0deg) rotateZ(0deg)`;
      }
    }, [
      isMouseEnter,
      translateX,
      translateY,
      translateZ,
      rotateX,
      rotateY,
      rotateZ,
    ]);

    return (
      <Tag
        ref={ref}
        className={cn("w-fit transition duration-200 ease-linear", className)}
        {...rest}
      >
        {children}
      </Tag>
    );
  };

  // Format price with spaces for thousands
  const formatPrice = (price) => {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  };

  // Main Component Render
  return (
    <div className="w-full h-full flex items-center justify-center">
      <CardContainer className="inter-var">
        <CardBody className="bg-gradient-to-br from-blue-900 via-gray-900 to-black relative group/card hover:shadow-2xl hover:shadow-blue-500/[0.3] border-white/[0.2] rounded-xl p-6 border h-[450px] text-white">
          {/* Marque */}
          <CardItem translateZ="50" className="text-xl font-bold text-white">
            {voiture.marque}
          </CardItem>
          
          {/* Modèle */}
          <CardItem
            as="p"
            translateZ="60"
            className="text-blue-300 text-lg font-semibold mt-1"
          >
            {voiture.modele}
          </CardItem>
          
          {/* Image de la voiture */}
          <CardItem translateZ="100" className="w-full mt-4">
            <img
              src={voiture.image}
              className="h-48 w-full object-cover rounded-xl group-hover/card:shadow-xl"
              alt={`${voiture.marque} ${voiture.modele}`}
            />
          </CardItem>
          
          {/* Caractéristiques */}
          <CardItem translateZ="40" className="mt-4 w-full">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex items-center gap-1">
                <span className="text-gray-400">Couleur:</span>
                <span>{voiture.couleur}</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-gray-400">Kilométrage:</span>
                <span>{voiture.kilometrage} km</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-gray-400">Carburant:</span>
                <span>{voiture.typeDeCarburant}</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-gray-400">Boîte:</span>
                <span>{voiture.boiteVitesse}</span>
              </div>
            </div>
          </CardItem>
          
          {/* Prix conditionnels */}
          <div className="flex flex-col mt-4">
            {voiture.aVendre && isBuyRoute && (
              <CardItem
                translateZ={20}
                as="p"
                className="text-lg font-bold text-white"
              >
                Achat: {formatPrice(voiture.prixVente)} DH
              </CardItem>
            )}
            {voiture.aLouer && isRentRoute && (
              <CardItem
                translateZ={20}
                as="p"
                className="text-lg font-bold text-white"
              >
                Location: {formatPrice(voiture.prixLocation)} DH/Jour
              </CardItem>
            )}
          </div>
          
          {/* Boutons d'action conditionnels */}
          <div className="flex justify-between items-center mt-4 gap-2">
            {voiture.aVendre && isBuyRoute && (
              <CardItem
                translateZ={30}
                as="button"
                className="px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 transition-colors flex-1"
                onClick={handleAcheter}
              >
                Acheter
              </CardItem>
            )}
            {voiture.aLouer && isRentRoute && (
              <CardItem
                translateZ={30}
                as="button"
                className="px-4 py-2 rounded-xl bg-purple-600 text-white text-sm font-bold hover:bg-purple-700 transition-colors flex-1"
                onClick={handleLouer}
              >
                Louer
              </CardItem>
            )}
          </div>
        </CardBody>
      </CardContainer>
    </div>
  );
};

export default FloatingCarCard;