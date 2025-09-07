import React from 'react';
import { 
  TreePine, 
  Laptop, 
  BookOpen, 
  Heart, 
  Megaphone, 
  Camera, 
  Users, 
  Palette, 
  Scissors
} from 'lucide-react';

const Cells = () => {
  const mainPrograms = [
    {
      id: 1,
      title: "Plantation Initiative",
      icon: TreePine,
      image: "/pt.jpg",
      description: "Our initiative celebrates volunteer birthdays by planting trees on their special day. We also plant trees in areas with sparse vegetation and conduct cleanliness drives to maintain a clean and healthy environment.",
      features: [
        "Birthday Tree Planting",
        "Afforestation in sparse areas", 
        "Cleanliness drives",
        "Environmental awareness"
      ]
    },
    {
      id: 2,
      title: "Computer Literacy Program (CLP)",
      icon: Laptop,
      image: "/cld.png",
      description: "We have adopted Adarsh Primary Vidhyalaya for our Computer Literacy Program. We bring students to our computer lab to teach them about computers, how they work, and how to write applications, along with practical life skills.",
      features: [
        "School adoption program",
        "Computer lab training",
        "Application development basics",
        "Practical life skills"
      ]
    },
    {
      id: 3,
      title: "Disha Program",
      icon: BookOpen,
      image: "/edu.jpg",
      description: "We have adopted the same school for our Disha Program, where we provide basic education including English, grammar, and money management skills to equip students with tools for success in society.",
      features: [
        "English language training",
        "Grammar and vocabulary",
        "Money management skills",
        "Ethics and moral values"
      ]
    }
    
  ];

  const additionalPrograms = [
    {
      id: 5,
      title: "Blood Donation Program",
      icon: Heart,
      image: "/blood.jpeg",
      description: "Regular blood donation drives to help save lives and create awareness about the importance of blood donation in the community."
    },
    {
      id: 6 ,
      title: "Awareness Programs",
      icon: Megaphone,
      image: "/act.png",
      description: "Conducting Nukkad Natak (street plays), rallies, and other awareness campaigns to spread social messages and create community awareness."
    },
    {
      id: 7,
      title: "Cloth Donation Drive",
      icon: Heart,
      image: "/cloth.heic",
      description: "Organizing cloth donation drives to help underprivileged families and communities by providing them with essential clothing and warmth."
    },
    {
        id: 8,
        title: "SVEEP Program",
        icon: BookOpen,
        image: "/sveep.webp",
        description: "The Systematic Voters' Education and Electoral Participation (SVEEP) program is the flagship initiative of the Election Commission of India. Its mission is to promote voter literacy and build a stronger, more participative democracy by encouraging all eligible citizens, especially youth and marginalized groups, to make informed and ethical voting decisions.",
        features: [
          "Voter literacy promotion",
          "Youth engagement in democracy",
          "Marginalized groups inclusion",
          "Informed voting decisions"
        ]
      }
  ];

  const cells = [
    {
      id: 1,
      title: "Photography & Videography",
      icon: Camera,
      description: "Our volunteers document all events by capturing high-quality photos and video clips. These are used for social media posts and preserved as cherished memories."
    },
    {
      id: 2,
      title: "Organizing Cell",
      icon: Users,
      description: "This category includes activities such as dancing, singing, skit and drama, and event management. We ensure any student with an idea for a performance or event has the support and resources needed."
    },
    {
      id: 3,
      title: "Graphic Designing",
      icon: Palette,
      description: "Our volunteers contribute to various projects by providing support in graphic and poster design and video editing for all NSS activities and events."
    },
    {
      id: 4,
      title: "Art & Craft",
      icon: Scissors,
      description: "Our volunteers create useful products from recycled materials and express social messages through their paintings and other artwork, promoting sustainability and creativity."
    }
  ];

  const ProgramCard = ({ program, isMain = false }) => {
    const Icon = program.icon;
    return (
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
        {program.image && (
          <div className="h-48 w-full overflow-hidden">
            <img 
              src={program.image} 
              alt={program.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        <div className="p-6">
          <div className="flex items-center mb-3">
            <div className="p-2 bg-blue-100 rounded-lg mr-3">
              <Icon className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800">
              {program.title}
            </h3>
          </div>
          <p className="text-gray-600 mb-4 leading-relaxed">
            {program.description}
          </p>
          {isMain && program.features && (
            <div className="space-y-2">
              <h4 className="font-medium text-gray-800">Key Activities:</h4>
              <ul className="space-y-1">
                {program.features.map((feature, index) => (
                  <li key={index} className="flex items-center text-sm text-gray-600">
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></span>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            NSS Programs & Cells
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Our various programs and specialized cells working together for community development
          </p>
        </div>

        {/* Main Programs Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
           Our Initiatives
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mainPrograms.map((program) => (
              <ProgramCard key={program.id} program={program} isMain={true} />
            ))}
          </div>
        </section>

        {/* Additional Programs Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Additional Programs
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {additionalPrograms.map((program) => (
              <ProgramCard key={program.id} program={program} />
            ))}
          </div>
        </section>

        {/* Cells Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Specialized Cells
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {cells.map((cell) => (
              <ProgramCard key={cell.id} program={cell} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Cells;
