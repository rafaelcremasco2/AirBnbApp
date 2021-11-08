import React from 'react';
import PropTypes from 'prop-types';
import { StatusBar, Modal } from 'react-native'; // Adicionado o Modal
import { RNCamera } from 'react-native-camera';
import MapboxGL from '@mapbox/react-native-mapbox-gl';
import {
    Container,
    AnnotationContainer,
    AnnotationText,
    NewButtonContainer,
    ButtonsWrapper,
    CancelButtonContainer,
    SelectButtonContainer,
    ButtonText,
    Marker,
    ModalContainer,
    ModalImagesListContainer,
    ModalImagesList,
    ModalImageItem,
    ModalButtons,
    CameraButtonContainer,
    CancelButtonText,
    ContinueButtonText,
    TakePictureButtonContainer,
    TakePictureButtonLabel,
} from './styles';

MapboxGL.setAccessToken('<aqui_vai_seu_token>');

export default class Main extends Component {
    static navigationOptions = {
        header: null,
    }

    state = {
        locations: [],
        newRealty: false,
        cameraModalOpened: false,
        dataModalOpened: false,
        realtyData: {
            location: {
                latitude: null,
                longitude: null,
            },
            name: '',
            price: '',
            address: '',
            images: [],
        },
    };

    handleNewRealtyPress = () =>
        this.setState({ newRealty: !this.state.newRealty })

    handleGetPositionPress = async () => {
        try {
            const [longitude, latitude] = await this.map.getCenter();
            this.setState({
                cameraModalOpened: true,
                realtyData: {
                    ...this.state.realtyData,
                    location: {
                        latitude,
                        longitude,
                    },
                },
            });
        } catch (err) {
            console.tron.log(err);
        }
    }

    async componentDidMount() {
        try {
            const response = await api.get('/properties', {
                params: {
                    latitude: -27.210768,
                    longitude: -49.644018,
                },
            });

            this.setState({ locations: response.data });
        } catch (err) {
            console.tron.log(err);
        }
    }

    handleTakePicture = async () => {
        if (this.camera) {
            const options = { quality: 0.5, base64: true, forceUpOrientation: true, fixOrientation: true, };
            const data = await this.camera.takePictureAsync(options)
            const { realtyData } = this.state;
            this.setState({
                realtyData: {
                    ...realtyData,
                    images: [
                        ...realtyData.images,
                        data,
                    ]
                }
            })
        }
    }

    renderImagesList = () => (
        this.state.realtyData.images.length !== 0 ? (
            <ModalImagesListContainer>
                <ModalImagesList horizontal>
                    {this.state.realtyData.images.map(image => (
                        <ModalImageItem source={{ uri: image.uri }} resizeMode="stretch" />
                    ))}
                </ModalImagesList>
            </ModalImagesListContainer>
        ) : null
    )

    handleCameraModalClose = () => this.setState({ cameraModalOpened: !this.state.cameraModalOpened })

    handleDataModalClose = () => this.setState({
        dataModalOpened: !this.state.dataModalOpened,
        cameraModalOpened: false,
    })

    renderCameraModal = () => (
        <Modal
            visible={this.state.cameraModalOpened}
            transparent={false}
            animationType="slide"
            onRequestClose={this.handleCameraModalClose}
        >
            <ModalContainer>
                <ModalContainer>
                    <RNCamera
                        ref={camera => {
                            this.camera = camera;
                        }}
                        style={{ flex: 1 }}
                        type={RNCamera.Constants.Type.back}
                        autoFocus={RNCamera.Constants.AutoFocus.on}
                        flashMode={RNCamera.Constants.FlashMode.off}
                        permissionDialogTitle={"Permission to use camera"}
                        permissionDialogMessage={
                            "We need your permission to use your camera phone"
                        }
                    />
                    <TakePictureButtonContainer onPress={this.handleTakePicture}>
                        <TakePictureButtonLabel />
                    </TakePictureButtonContainer>
                </ModalContainer>
                {this.renderImagesList()}
                <ModalButtons>
                    <CameraButtonContainer onPress={this.handleCameraModalClose}>
                        <CancelButtonText>Cancelar</CancelButtonText>
                    </CameraButtonContainer>
                    <CameraButtonContainer onPress={this.handleDataModalClose}>
                        <ContinueButtonText>Continuar</ContinueButtonText>
                    </CameraButtonContainer>
                </ModalButtons>
            </ModalContainer>
        </Modal>
    )

    renderLocations = () => (
        this.state.locations.map(location => (
            <MapboxGL.PointAnnotation
                id={location.id.toString()}
                coordinate={[parseFloat(location.longitude), parseFloat(location.latitude)]}
            >
                <AnnotationContainer>
                    <AnnotationText>{location.price}</AnnotationText>
                </AnnotationContainer>
                <MapboxGL.Callout title={location.title} />
            </MapboxGL.PointAnnotation>
        ))
    )

    renderConditionalsButtons = () => (
        !this.state.newRealty ? (
            <NewButtonContainer onPress={this.handleNewRealtyPress}>
                <ButtonText>Novo Imóvel</ButtonText>
            </NewButtonContainer>
        ) : (
            <ButtonsWrapper>
                <SelectButtonContainer onPress={this.handleGetPositionPress}>
                    <ButtonText>Selecionar localização</ButtonText>
                </SelectButtonContainer>
                <CancelButtonContainer onPress={this.handleNewRealtyPress}>
                    <ButtonText>Cancelar</ButtonText>
                </CancelButtonContainer>
            </ButtonsWrapper>
        )
    )

    renderMarker = () => (
        this.state.newRealty &&
        !this.state.cameraModalOpened &&
        <Marker resizeMode="contain" source={require('../../images/marker.png')} />
    )

    render() {
        return (
            <Container>
                <StatusBar barStyle="light-content" />
                <MapboxGL.MapView
                    centerCoordinate={[-49.6446024, -27.2108001]}
                    style={{ flex: 1 }}
                    styleURL={MapboxGL.StyleURL.Dark}
                    ref={map => {
                        this.map = map;
                    }}
                >
                    {this.renderLocations()}
                </MapboxGL.MapView>
                {this.renderConditionalsButtons()}
                {this.renderMarler()}
            </Container>
        );
    }
}


Main.navigationOptions = {
    header: null,
};

Main.propTypes = {
    navigation: PropTypes.shape({
        state: PropTypes.shape({
            params: PropTypes.shape({
                token: PropTypes.string,
            }),
        }),
    }).isRequired,
};

export default Main;