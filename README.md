Animal Rescue Network:
A full-stack web application connecting animal lovers, volunteers, donors, and adopters to rescue, treat, and find forever homes for stray and lost animals.

Live Links:
Live Application: https://animal-rescue-network-frontend.vercel.app
Backend API: https://animal-rescue-network-backend-95mm.onrender.com
Frontend Source Code: https://github.com/bhavyabaikan-cyber/Animal-Rescue-Network-frontend
Backend Source Code: https://github.com/bhavyabaikan-cyber/Animal-Rescue-Network-Backend

Key Features:
->Multi-role authentication with JWT
->Case management from report to adoption
->Interactive rescue map with geolocation
->Secure Stripe payment integration
->Real-time notifications using Socket.IO
->Adoption application system
->Comments, likes, and sharing
->Direct messaging between users

Tech Stack:
->Frontend: React.js, Vite, Tailwind CSS, React Router, Axios, Socket.IO Client, React Leaflet
->Backend: Node.js, Express.js, MongoDB, Mongoose, JWT, Bcrypt, Socket.IO, Stripe API, Multer, Nodemailer
->Deployment: Vercel (Frontend), Render (Backend), MongoDB Atlas (Database)

Role-Specific Operations:
1. Reporter (Person who reports animals in need)
Can perform:
->Register and login to the platform
->Report a new stray or lost animal with photos, species, breed, description, urgency level, and location (with map coordinates)
->View all their reported cases in "My Reports" dashboard
->Track the real-time status of each case (Pending → In Transit → Rescued → Adopted)
->View statistics of their reports (total, pending, rescued, adopted counts)
->Receive notifications when a donation is made to their reported case
->Comment and like on rescue cases
->Share cases with others
->Update their profile and change password
->If they reported a lost pet, they can mark themselves as the owner
2. Volunteer (Person who coordinates rescues)
Can perform:
->Browse all pending rescue cases
->Accept a rescue case and become the assigned volunteer
->Update case status step-by-step (Pending → In Transit → Rescued → Adoption Pending)
->View all adoption applications submitted by adopters
->Review detailed adoption applications (applicant info, experience, living situation, other pets)
->Approve or reject adoption applications with optional rejection reasons
->Receive real-time notifications when:
->A new adoption application is submitted
->A donation is received for a case they are handling
->Chat directly with reporters and adopters via the messaging system
->View their own dashboard with assigned cases
->Comment, like, and share cases
->Update their profile and change password
3. Donor (Person who funds rescues)
Can perform:
->Browse all cases that need financial support
->View detailed case information including photos, description, and current status
->Make secure online donations using Stripe payment gateway (in INR currency)
->Donate any amount to any case (visible on every case page)
->View their complete donation history in "My Donations" dashboard
->See total amount donated and number of cases funded
->View their pledged cases in "My Pledges" section
->Receive email receipts for every donation
->Track which cases they have supported
->Comment, like, and share cases
->Update their profile and change password
4. Adopter (Person who wants to adopt animals)
Can perform:
->Browse all rescued animals available for adoption (status: "Rescued" or "Adoption Pending")
->View detailed case information including photos, location, and volunteer assigned
->Submit detailed adoption applications with:
->Reason for wanting to adopt
->Previous experience with animals
->Living situation (apartment, house, etc.)
->Information about other pets at home
->Track the status of their adoption applications
->Cannot apply for "Lost" case type animals (only stray/rescued ones)
->Cannot apply if someone else has already applied
->Receive notifications about application status changes
->Comment, like, and share cases
->Update their profile and change password

Common Operations (Available to All Logged-in Users):
->View all rescue cases
->View case details with photos and location
->Use the interactive map to find nearby animals
->Filter animals by status (Pending, In Transit, Rescued, Adopted)
->Search animals within a specific radius from their location
->Comment on cases with text and photos
->Like/unlike comments
->Share cases
->Message assigned volunteers
->Change their password
->View their notification bell with unread count
->Mark notifications as read
