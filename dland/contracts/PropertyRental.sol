// SPDX-License-Identifier: MIT
pragma solidity >=0.4.21 <=0.7.4;
pragma experimental ABIEncoderV2;

import "@chainlink/contracts/src/v0.6/interfaces/AggregatorV3Interface.sol";

contract PropertyRental {
    // AggregatorV3Interface internal priceFeedMATICUSD;
    AggregatorV3Interface internal priceFeedETHUSD;
    AggregatorV3Interface internal priceFeedDAIUSD;

    constructor() public {
        // priceFeedMATICUSD = AggregatorV3Interface(
        //     0xd0D5e3DB44DE05E9F294BB0a3bEEaF030DE24Ada
        // );
        // priceFeedDAIUSD = AggregatorV3Interface(
        //     0x0FCAa9c899EC5A91eBc3D5Dd869De833b06fB046
        // );

        priceFeedETHUSD = AggregatorV3Interface(
            0x8A753747A1Fa494EC906cE90E9f37563A8AF630e
        );
        priceFeedDAIUSD = AggregatorV3Interface(
            0x2bA49Aaa16E6afD2a993473cfB70Fa8559B523cF
        );
    }

    // Property to be rented out on Property
    struct Property {
        uint256 propId;
        string propertyDescription; // Address;Contact
        uint16 area; // area in sq. feet
        uint8 furnishing; //0 Non 1 Semi 2 Fully
        uint128 availableFrom; // timestamp
        uint8 flatType; // 2 2BHK; 3 3BHK
        uint256 rent; // per day month in wei (1 ether = 10^18 wei)
        uint256 securityDeposit;
        address owner; // Owner of the property
        bool isBooked; // is property booked
        bool isActive; // is property active
        string imagesHash; //hash of images from IPFS ; seperated
    }

    uint256 public propertyId;
    // mapping of propertyId to Property object
    mapping(uint256 => Property) public properties;

    // Details of a particular booking
    struct Booking {
        uint256 propertyId;
        uint128 checkInDate;
        uint128 checkoutDate;
        address tenant;
    }

    uint256 public bookingId;

    // mapping of bookingId to Booking object
    mapping(uint256 => Booking) public bookings;
    mapping(uint256 => uint256) propertyToBooking;
    
    // This event is emitted when a new property is put up for rent
    event NewProperty(uint256 indexed propertyId);

    // This event is emitted when a New Booking is made
    event NewBooking(uint256 indexed propertyId, uint256 indexed bookingId);

    /**
     * @dev Put up an Property property in the market
     */
    function rentOutproperty(
        string memory propertyDescription,
        uint16 area,
        uint8 furnishing,
        uint128 availableFrom,
        uint8 flatType,
        uint256 rent,
        uint256 secutityDeposit,
        string memory imageHash
    ) public {
        Property memory property =
            Property(
                propertyId,
                propertyDescription,
                area,
                furnishing,
                availableFrom,
                flatType,
                rent,
                secutityDeposit,
                msg.sender, /* owner */
                false,
                true,
                imageHash
            );

        // Persist `property` object to the "permanent" storage
        properties[propertyId] = property;

        // emit an event to notify the clients
        emit NewProperty(propertyId++);
    }

    /**
     * @dev Make an Property booking
     */
    function rentProperty(
        uint256 _propertyId,
        uint128 checkInDate,
        uint128 checkoutDate
    ) public payable {
        // Retrieve `property` object from the storage
        Property memory property = properties[_propertyId];

        // Assert that property is active
        require(property.isActive == true,"property with this ID is not active");

        // Assert that property not booked
        require(property.isBooked == false,"property with this ID is not available");

        uint256 ethDeposit = convertUSDToEth(property.securityDeposit);

        // Check the customer has sent an amount equal to (rentPerDay * numberOfDays)
        require(msg.value >= ethDeposit, "Sent insufficient funds");

        // send funds to the owner of the property
        _sendFunds(property.owner, msg.value);

        // conditions for a booking are satisfied, so make the booking
        _createBooking(_propertyId, checkInDate, checkoutDate);
    }

    function _createBooking(
        uint256 _propertyId,
        uint128 checkInDate,
        uint128 checkoutDate
    ) internal {
        // Create a new booking object
        bookings[bookingId] = Booking(
            _propertyId,
            checkInDate,
            checkoutDate,
            msg.sender
        );

        // Mark the property booked
        properties[_propertyId].isBooked = true;
        propertyToBooking[_propertyId] = bookingId;

        // Emit an event to notify clients
        emit NewBooking(_propertyId, bookingId++);
    }

    function _sendFunds(address _beneficiary, uint256 _value) internal {
        // address(uint160()) is a weird solidity quirk
        // Read more here: https://solidity.readthedocs.io/en/v0.5.10/050-breaking-changes.html?highlight=address%20payable#explicitness-requirements
        //address(uint160(beneficiary)).transfer(value);
        (bool sent, ) = address(uint160(_beneficiary)).call{value: _value}("");
        require(sent, "Failed to transfer deposit!");
    }

    /**
     * @dev Take down the property from the market
     */
    function markPropertyAsInactive(uint256 _propertyId) public {
        require(properties[_propertyId].owner == msg.sender,"THIS IS NOT YOUR PROPERTY");
        require(properties[_property].isBooked == false, "The property is currently booked");
        properties[_propertyId].isActive = false;
    }

    /**
     * @dev Advertise the property again in the market
     */
    function markPropertyAsActive(uint256 _propertyId) public {
        require(
            properties[_propertyId].owner == msg.sender,
            "THIS IS NOT YOUR PROPERTY"
        );
        properties[_propertyId].isActive = true;
    }

    //Get total number of proprties
    function getTotalProperties() public view returns (uint256) {
        return propertyId;
    }

    //Get 8 available properties from current location
    function getProperties(uint256 loc)
        public
        view
        returns (Property[] memory, uint8)
    {
        Property[] memory propertyBundle = new Property[](8);
        uint8 j = 0;
        for (uint256 i = loc; j < 8 && i < propertyId; i++) {
            if (properties[i].isActive) {
                propertyBundle[j++] = properties[i];
            }
        }
        return (propertyBundle, j);
    }

    //Get listed properties by owner
    function getMyProperties(uint256 loc, address caller)
        public
        view
        returns (
            Property[] memory,
            Booking[] memory,
            uint8
        )
    {
        Property[] memory propertyBundle = new Property[](2);
        Booking[] memory bookingBundle = new Booking[](2);
        uint8 j = 0;
        uint256 k = 0;
        for (uint256 i = loc; j < 2 && i < propertyId; i++) {
            if (properties[i].owner == caller) {
                Property memory prop = properties[i];
                propertyBundle[j] = prop;
                k = propertyToBooking[prop.propId];
                bookingBundle[j++] = bookings[k];
            }
        }

        // uint256 k = 0;
        // for (uint256 i = 0; k < 2 && i < bookingId && k < j; i++) {
        //     if (bookings[i].propertyId == propertyBundle[k].propId) {
        //         Booking storage booked = bookings[i];
        //         bookingBundle[k++] = booked;
        //     }
        // }
        return (propertyBundle, bookingBundle, j);
    }

    //Get Booked properties by tenant
    function getMyBookings(uint256 loc, address caller)
        public
        view
        returns (
            Property[] memory,
            Booking[] memory,
            uint8
        )
    {
        Property[] memory propertyBundle = new Property[](2);
        Booking[] memory bookingBundle = new Booking[](2);
        uint8 j = 0;
        for (uint256 i = loc; j < 2 && i < propertyId; i++) {
            if (bookings[i].tenant == caller) {
                Booking memory booked = bookings[i];
                bookingBundle[j] = booked;
                propertyBundle[j++] = properties[booked.propertyId];
            }
        }
        return (propertyBundle, bookingBundle, j);
    }

    // It's ETHER not MATIC
    function getLatestPriceMATIC() public view returns (int256) {
        (
            uint80 roundID,
            int256 price,
            uint256 startedAt,
            uint256 timeStamp,
            uint80 answeredInRound
        ) = priceFeedETHUSD.latestRoundData();
        // If the round is not complete yet, timestamp is 0
        require(timeStamp > 0, "Round not complete");
        return price;
    }

    function getLatestPriceDAI() public view returns (int256) {
        (
            uint80 roundID,
            int256 price,
            uint256 startedAt,
            uint256 timeStamp,
            uint80 answeredInRound
        ) = priceFeedDAIUSD.latestRoundData();
        // If the round is not complete yet, timestamp is 0
        require(timeStamp > 0, "Round not complete");
        return price;
    }

    // Function to convert amounts in USD to ETH
    function convertUSDToEth(uint256 _value) public view returns (uint256) {
        int256 ethUsdPrice = getLatestPriceMATIC();
        return (_value*10 ** 26) /uint256(ethUsdPrice);
    }

    // function getDepositedETH(uint256 _bookedId) public view returns (uint256){
    //     return depositedSecurity[_bookedId];
    // }

    // to cancel a booking and initiate security refund
    function cancelBooking(uint256 _propId) public payable{
        Property memory prop = properties[_propId];

        //Validate only property owner can cancel booking
        require(prop.owner == msg.sender,"THIS IS NOT YOUR PROPERTY");
        require(prop.isBooked == true, "The property is not booked");

        //load the booking
        uint256 _booking = propertyToBooking[_propId];
        Booking memory booked = bookings[_booking];

        uint256 ethDeposit = convertUSDToEth(prop.securityDeposit);
        // Check the customer has sent an amount equal to security deposit
        require(msg.value >= ethDeposit, "Sent insufficient funds");

        // send funds to the owner of the property
        _sendFunds(booked.tenant, msg.value);

        //conditions for cancellation are satisfied so deleting booking
        _cancelBooking(_booking);
    }

    function _cancelBooking(uint256 _booking) internal{
        Booking memory booked = bookings[_booking];
        //mark booking cancelled
        properties[booked.propertyId].isBooked = false;
        propertyToBooking[booked.propertyId] = 0;
        bookings[_booking].checkInDate = 0;
        bookings[_booking].checkoutDate = 0;
        bookings[_booking].tenant = address(0);
        bookings[_booking].propertyId = 0;
    }
}
